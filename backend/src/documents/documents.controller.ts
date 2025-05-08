// documents/documents.controller.ts
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Get('generate/:templateId')
    async generate(
        @Param('templateId') templateId: string,
        @Req() req: Request & { user: User }
    ) {
        return this.documentsService.generateDocument(req.user, templateId);
    }
}
