import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Password } from './entities/password.entity';
import { User } from '../users/entities/user.entity';
import { EncryptionService } from '../encryption/encryption.service';
import { CreatePasswordDto } from './dto/create-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class PasswordsService {
  constructor(
    @InjectRepository(Password)
    private passwordRepository: Repository<Password>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private encryptionService: EncryptionService,
  ) {}

  /**
   * Establece la master password por primera vez
   */
  async setMasterPassword(userId: string, masterPassword: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.masterPasswordHash) {
      throw new BadRequestException('Master password already set');
    }

    // Generar salt único para el usuario
    const salt = this.encryptionService.generateSalt();

    // Hash de la master password para verificación
    const hash = await this.encryptionService.hashMasterPassword(
      masterPassword,
    );

    // Actualizar usuario
    user.masterPasswordHash = hash;
    user.masterPasswordSalt = salt;
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Master password set successfully',
    };
  }

  /**
   * Verifica la master password
   */
  async verifyMasterPassword(userId: string, masterPassword: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.masterPasswordHash) {
      throw new BadRequestException('Master password not set');
    }

    const isValid = await this.encryptionService.verifyMasterPassword(
      masterPassword,
      user.masterPasswordHash,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid master password');
    }

    return {
      success: true,
      message: 'Master password verified',
      hasMasterPassword: true,
    };
  }

  /**
   * Verifica si el usuario tiene master password configurada
   */
  async hasMasterPassword(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return !!user.masterPasswordHash;
  }

  /**
   * Crea una nueva contraseña cifrada
   */
  async create(userId: string, createPasswordDto: CreatePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.masterPasswordHash) {
      throw new BadRequestException(
        'Master password must be set before creating passwords',
      );
    }

    // Verificar master password
    const isValid = await this.encryptionService.verifyMasterPassword(
      createPasswordDto.masterPassword,
      user.masterPasswordHash,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid master password');
    }

    // Generar salt único para esta contraseña
    const salt = this.encryptionService.generateSalt();

    // Preparar datos a cifrar
    const dataToEncrypt = {
      title: createPasswordDto.title,
      url: createPasswordDto.url,
      username: createPasswordDto.username,
      password: createPasswordDto.password,
      notes: createPasswordDto.notes,
    };

    // Cifrar datos
    const { encryptedData, iv, authTag } = this.encryptionService.encrypt(
      dataToEncrypt,
      createPasswordDto.masterPassword,
      salt,
    );

    // Combinar encryptedData y authTag para almacenar
    const combinedData = `${encryptedData}:${authTag}`;

    // Crear registro
    const password = this.passwordRepository.create({
      userId,
      encryptedData: combinedData,
      iv,
      salt,
      title: createPasswordDto.title,
      username: createPasswordDto.username,
      url: createPasswordDto.url,
    });

    await this.passwordRepository.save(password);

    return {
      id: password.id,
      createdAt: password.createdAt,
      updatedAt: password.updatedAt,
    };
  }

  /**
   * Lista todas las contraseñas del usuario (sin descifrar)
   */
  async findAll(userId: string) {
    const passwords = await this.passwordRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });

    return passwords.map((p) => ({
      id: p.id,
      title: p.title,
      username: p.username,
      url: p.url,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      // No se incluyen los datos cifrados en la lista
    }));
  }

  /**
   * Descifra una contraseña específica
   */
  async decryptPassword(
    userId: string,
    passwordId: string,
    masterPassword: string,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verificar master password
    const isValid = await this.encryptionService.verifyMasterPassword(
      masterPassword,
      user.masterPasswordHash,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid master password');
    }

    const password = await this.passwordRepository.findOne({
      where: { id: passwordId, userId },
    });

    if (!password) {
      throw new NotFoundException('Password not found');
    }

    try {
      // Separar encryptedData y authTag
      const [encryptedData, authTag] = password.encryptedData.split(':');

      // Descifrar
      const decryptedData = this.encryptionService.decrypt(
        encryptedData,
        password.iv,
        authTag,
        masterPassword,
        password.salt,
      );

      return {
        id: password.id,
        ...decryptedData,
        createdAt: password.createdAt,
        updatedAt: password.updatedAt,
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to decrypt password');
    }
  }

  /**
   * Actualiza una contraseña
   */
  async update(
    userId: string,
    passwordId: string,
    updatePasswordDto: UpdatePasswordDto,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verificar master password
    const isValid = await this.encryptionService.verifyMasterPassword(
      updatePasswordDto.masterPassword,
      user.masterPasswordHash,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid master password');
    }

    const password = await this.passwordRepository.findOne({
      where: { id: passwordId, userId },
    });

    if (!password) {
      throw new NotFoundException('Password not found');
    }

    // Generar nuevo salt para la actualización
    const newSalt = this.encryptionService.generateSalt();

    // Preparar datos actualizados
    const dataToEncrypt = {
      title: updatePasswordDto.title,
      url: updatePasswordDto.url,
      username: updatePasswordDto.username,
      password: updatePasswordDto.password,
      notes: updatePasswordDto.notes,
    };

    // Cifrar nuevos datos
    const { encryptedData, iv, authTag } = this.encryptionService.encrypt(
      dataToEncrypt,
      updatePasswordDto.masterPassword,
      newSalt,
    );

    // Combinar encryptedData y authTag
    const combinedData = `${encryptedData}:${authTag}`;

    // Actualizar
    password.encryptedData = combinedData;
    password.iv = iv;
    password.salt = newSalt;
    password.title = updatePasswordDto.title;
    password.username = updatePasswordDto.username;
    password.url = updatePasswordDto.url;

    await this.passwordRepository.save(password);

    return {
      id: password.id,
      updatedAt: password.updatedAt,
    };
  }

  /**
   * Elimina una contraseña
   */
  async remove(userId: string, passwordId: string) {
    const password = await this.passwordRepository.findOne({
      where: { id: passwordId, userId },
    });

    if (!password) {
      throw new NotFoundException('Password not found');
    }

    await this.passwordRepository.remove(password);

    return { success: true };
  }
  /**
   * Verifica la master password y devuelve todas las contraseñas descifradas
   */
  async unlockAndList(userId: string, masterPassword: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verificar master password
    const isValid = await this.encryptionService.verifyMasterPassword(
      masterPassword,
      user.masterPasswordHash,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid master password');
    }

    const passwords = await this.passwordRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });

    const decryptedPasswords = await Promise.all(
      passwords.map(async (p) => {
        try {
          const [encryptedData, authTag] = p.encryptedData.split(':');
          const decryptedData = this.encryptionService.decrypt(
            encryptedData,
            p.iv,
            authTag,
            masterPassword,
            p.salt,
          );
          return {
            id: p.id,
            ...decryptedData,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          };
        } catch (error) {
          // Si falla una, la devolvemos como error o null, pero no fallamos todo
          return {
            id: p.id,
            error: 'Failed to decrypt',
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          };
        }
      }),
    );

    return decryptedPasswords;
  }

  /**
   * Migra títulos de contraseñas existentes
   */
  async migrateTitles(userId: string, masterPassword: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verificar master password
    const isValid = await this.encryptionService.verifyMasterPassword(
      masterPassword,
      user.masterPasswordHash,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid master password');
    }

    const passwords = await this.passwordRepository.find({
      where: { userId },
    });

    let migrated = 0;
    for (const p of passwords) {
      if (!p.title) {
        try {
          const [encryptedData, authTag] = p.encryptedData.split(':');
          const decryptedData = this.encryptionService.decrypt(
            encryptedData,
            p.iv,
            authTag,
            masterPassword,
            p.salt,
          );
          if (decryptedData.title) {
            p.title = decryptedData.title;
            p.username = decryptedData.username;
            p.url = decryptedData.url;
            await this.passwordRepository.save(p);
            migrated++;
          }
        } catch (error) {
          console.error(`Failed to migrate password ${p.id}:`, error);
        }
      }
    }

    return { success: true, migrated };
  }
}
