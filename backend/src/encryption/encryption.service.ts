import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EncryptionService {
  private readonly ALGORITHM = 'aes-256-gcm';
  private readonly KEY_LENGTH = 32; // 256 bits
  private readonly IV_LENGTH = 16; // 128 bits
  private readonly SALT_LENGTH = 64;
  private readonly AUTH_TAG_LENGTH = 16;
  private readonly PBKDF2_ITERATIONS = 100000;

  /**
   * Genera un salt aleatorio
   */
  generateSalt(): string {
    return crypto.randomBytes(this.SALT_LENGTH).toString('hex');
  }

  /**
   * Deriva una clave de cifrado desde la master password usando PBKDF2
   */
  private deriveKey(masterPassword: string, salt: string): Buffer {
    return crypto.pbkdf2Sync(
      masterPassword,
      Buffer.from(salt, 'hex'),
      this.PBKDF2_ITERATIONS,
      this.KEY_LENGTH,
      'sha256',
    );
  }

  /**
   * Hash de la master password para almacenamiento y verificación
   * Usa bcrypt con salt automático
   */
  async hashMasterPassword(masterPassword: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(masterPassword, saltRounds);
  }

  /**
   * Verifica la master password contra el hash almacenado
   */
  async verifyMasterPassword(
    masterPassword: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(masterPassword, hash);
  }

  /**
   * Cifra datos usando AES-256-GCM
   * Retorna el texto cifrado, IV y auth tag
   */
  encrypt(
    data: any,
    masterPassword: string,
    salt: string,
  ): { encryptedData: string; iv: string; authTag: string } {
    try {
      // Derivar clave de la master password
      const key = this.deriveKey(masterPassword, salt);

      // Generar IV aleatorio
      const iv = crypto.randomBytes(this.IV_LENGTH);

      // Crear cipher
      const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

      // Convertir data a JSON string
      const jsonData = JSON.stringify(data);

      // Cifrar
      let encrypted = cipher.update(jsonData, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Obtener authentication tag
      const authTag = cipher.getAuthTag();

      return {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Descifra datos usando AES-256-GCM
   * Requiere el IV y auth tag originales
   */
  decrypt(
    encryptedData: string,
    iv: string,
    authTag: string,
    masterPassword: string,
    salt: string,
  ): any {
    try {
      // Derivar clave de la master password
      const key = this.deriveKey(masterPassword, salt);

      // Crear decipher
      const decipher = crypto.createDecipheriv(
        this.ALGORITHM,
        key,
        Buffer.from(iv, 'hex'),
      );

      // Establecer auth tag
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));

      // Descifrar
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      // Parsear JSON
      return JSON.parse(decrypted);
    } catch (error) {
      throw new Error(`Decryption failed: Invalid password or corrupted data`);
    }
  }
}
