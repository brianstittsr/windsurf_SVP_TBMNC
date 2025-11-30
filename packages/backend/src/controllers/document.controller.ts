import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../database/data-source';
import { Document } from '../entities/Document';
import { AppError } from '../middleware/error-handler';

export class DocumentController {
  private documentRepository = AppDataSource.getRepository(Document);

  upload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: Implement S3 upload logic
      const { customerId, documentType, fileName, fileSize, mimeType } = req.body;

      const document = this.documentRepository.create({
        customerId,
        documentType,
        fileName,
        fileSize,
        mimeType,
        s3Key: `customers/${customerId}/${Date.now()}-${fileName}`,
        uploadedBy: req.body.userId, // From auth middleware
        status: 'uploaded',
      });

      const savedDocument = await this.documentRepository.save(document);

      res.status(201).json({
        success: true,
        data: savedDocument,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const document = await this.documentRepository.findOne({ where: { id } });

      if (!document) {
        throw new AppError('Document not found', 404);
      }

      res.json({
        success: true,
        data: document,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  download = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const document = await this.documentRepository.findOne({ where: { id } });

      if (!document) {
        throw new AppError('Document not found', 404);
      }

      // TODO: Generate S3 signed URL
      const downloadUrl = `https://s3.amazonaws.com/${document.s3Key}`;

      res.json({
        success: true,
        data: { downloadUrl, document },
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const document = await this.documentRepository.findOne({ where: { id } });
      if (!document) {
        throw new AppError('Document not found', 404);
      }

      Object.assign(document, updateData);
      const updatedDocument = await this.documentRepository.save(document);

      res.json({
        success: true,
        data: updatedDocument,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const document = await this.documentRepository.findOne({ where: { id } });

      if (!document) {
        throw new AppError('Document not found', 404);
      }

      // TODO: Delete from S3
      await this.documentRepository.remove(document);

      res.json({
        success: true,
        data: { message: 'Document deleted successfully' },
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };
}
