import { prisma } from '../../db/prisma';
import { FileMetadata, FileWithContent, FileVisibility, FileListParams, FileListResponse } from './file.types';

export class FileService {
  async listFiles(ownerId: string, params?: FileListParams): Promise<FileListResponse> {
    const page = params?.page || 1;
    const limit = Math.min(params?.limit || 20, 100); // Max 100 items per page
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = { ownerId };
    
    // Filter by visibility
    if (params?.visibility) {
      where.visibility = params.visibility;
    }
    
    // Search by filename (case-insensitive)
    // Note: SQLite doesn't support 'insensitive' mode natively
    // We'll use contains which works but is case-sensitive in SQLite
    // For better case-insensitive search, we could use raw SQL, but for MVP this is acceptable
    if (params?.search) {
      where.filename = {
        contains: params.search,
      };
    }
    
    // Build orderBy clause
    const sortField = params?.sort || 'createdAt';
    const sortOrder = params?.order || 'desc';
    const orderBy: any = {};
    orderBy[sortField] = sortOrder;
    
    // Get total count for pagination
    const total = await prisma.file.count({ where });
    
    // Get files
    const files = await prisma.file.findMany({
      where,
      select: {
        id: true,
        ownerId: true,
        filename: true,
        sizeBytes: true,
        visibility: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      files: files as FileMetadata[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getFileById(fileId: string, ownerId?: string): Promise<FileWithContent> {
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        // If ownerId provided, ensure it matches. Otherwise allow null ownerId (anonymous files)
        ...(ownerId !== undefined ? { ownerId } : {}),
      },
    });

    if (!file) {
      throw new Error('File not found');
    }

    return file as FileWithContent;
  }

  async getFileByIdPublic(fileId: string): Promise<FileWithContent> {
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
      },
    });

    if (!file) {
      throw new Error('File not found');
    }

    return file as FileWithContent;
  }

  async uploadFile(
    ownerId: string,
    filename: string,
    content: string,
    visibility: FileVisibility = 'private'
  ): Promise<FileMetadata> {
    const file = await prisma.file.create({
      data: {
        ownerId,
        filename,
        content,
        sizeBytes: Buffer.byteLength(content, 'utf8'),
        visibility,
      },
      select: {
        id: true,
        ownerId: true,
        filename: true,
        sizeBytes: true,
        visibility: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return file as FileMetadata;
  }

  async uploadFileAnonymous(
    filename: string,
    content: string,
    visibility: FileVisibility = 'private'
  ): Promise<FileMetadata> {
    const file = await prisma.file.create({
      data: {
        ownerId: null,
        filename,
        content,
        sizeBytes: Buffer.byteLength(content, 'utf8'),
        visibility,
      },
      select: {
        id: true,
        ownerId: true,
        filename: true,
        sizeBytes: true,
        visibility: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return file as FileMetadata;
  }

  async claimFile(fileId: string, ownerId: string): Promise<FileMetadata> {
    // Check if file exists and is not already claimed
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        ownerId: null,
      },
    });

    if (!file) {
      throw new Error('File not found or already claimed');
    }

    // Update file with ownerId
    const updatedFile = await prisma.file.update({
      where: { id: fileId },
      data: { ownerId },
      select: {
        id: true,
        ownerId: true,
        filename: true,
        sizeBytes: true,
        visibility: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedFile as FileMetadata;
  }

  async deleteFile(fileId: string, ownerId: string): Promise<void> {
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        ownerId,
      },
    });

    if (!file) {
      throw new Error('File not found');
    }

    await prisma.file.delete({
      where: { id: fileId },
    });
  }
}

export const fileService = new FileService();

