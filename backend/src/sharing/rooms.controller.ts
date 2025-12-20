import { Controller, Post, Get, Delete, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { AddItemToRoomDto } from './dto/add-item-to-room.dto';
import { AddUserToRoomDto } from './dto/add-user-to-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  // Crear room (requiere auth)
  @Post()
  @UseGuards(JwtAuthGuard)
  async createRoom(@Request() req, @Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.createRoom(req.user.id, createRoomDto);
  }

  // Obtener mis rooms (requiere auth)
  @Get('my-rooms')
  @UseGuards(JwtAuthGuard)
  async getMyRooms(@Request() req) {
    return this.roomsService.getMyRooms(req.user.id);
  }

  // Obtener rooms compartidas conmigo (requiere auth)
 @Get('shared/with-me')
  @UseGuards(JwtAuthGuard)
  async getSharedWithMe(@Request() req) {
    return this.roomsService.getSharedWithMe(req.user.email);
  }

  // Acceder a room por token (público o privado con auth)
  @Get(':token')
  @UseGuards(OptionalJwtAuthGuard)
  async getRoomByToken(@Request() req, @Param('token') token: string) {
    // Si el usuario está autenticado, pasar su email para verificación de acceso
    const userEmail = req.user?.email;
    return this.roomsService.getRoomByToken(token, userEmail);
  }

  // Obtener items de una room (requiere auth)
  @Get(':roomId/items')
  @UseGuards(JwtAuthGuard)
  async getRoomItems(@Request() req, @Param('roomId') roomId: string) {
    return this.roomsService.getRoomItems(req.user.id, roomId);
  }

  // Agregar item a room (requiere auth)
  @Post(':roomId/items')
  @UseGuards(JwtAuthGuard)
  async addItemToRoom(
    @Request() req,
    @Param('roomId') roomId: string,
    @Body() addItemDto: AddItemToRoomDto,
  ) {
    return this.roomsService.addItemToRoom(req.user.id, roomId, addItemDto);
  }

  // Quitar item de room (requiere auth)
  @Delete(':roomId/items/:itemId')
  @UseGuards(JwtAuthGuard)
  async removeItemFromRoom(
    @Request() req,
    @Param('roomId') roomId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.roomsService.removeItemFromRoom(req.user.id, roomId, itemId);
  }

  // Actualizar permisos de un ítem (requiere auth)
  @Patch(':roomId/items/:itemId/permissions')
  @UseGuards(JwtAuthGuard)
  async updateItemPermissions(
    @Request() req,
    @Param('roomId') roomId: string,
    @Param('itemId') itemId: string,
    @Body() dto: any,
  ) {
    return this.roomsService.updateItemPermissions(req.user.id, roomId, itemId, dto);
  }

  // Eliminar room (requiere auth)
  @Delete(':roomId')
  @UseGuards(JwtAuthGuard)
  async deleteRoom(@Request() req, @Param('roomId') roomId: string) {
    return this.roomsService.deleteRoom(req.user.id, roomId);
  }

  // Obtener lista de acceso de una room (requiere auth)
  @Get(':roomId/access-list')
  @UseGuards(JwtAuthGuard)
  async getRoomAccessList(@Request() req, @Param('roomId') roomId: string) {
    return this.roomsService.getRoomAccessList(req.user.id, roomId);
  }

  // Agregar usuario a la whitelist de una room (requiere auth)
  @Post(':roomId/users')
  @UseGuards(JwtAuthGuard)
  async addUserToRoom(
    @Request() req,
    @Param('roomId') roomId: string,
    @Body() dto: AddUserToRoomDto,
  ) {
    return this.roomsService.addUserToRoom(req.user.id, roomId, dto);
  }

  // Quitar usuario de la whitelist de una room (requiere auth)
  @Delete(':roomId/users/:email')
  @UseGuards(JwtAuthGuard)
  async removeUserFromRoom(
    @Request() req,
    @Param('roomId') roomId: string,
    @Param('email') email: string,
  ) {
    return this.roomsService.removeUserFromRoom(req.user.id, roomId, email);
  }
}
