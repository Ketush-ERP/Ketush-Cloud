import { HttpStatus, OnModuleInit } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PrismaClient } from '@prisma/client';
import { ClientProxy } from '@nestjs/microservices';
export declare class CardService extends PrismaClient implements OnModuleInit {
    private readonly client;
    private readonly logger;
    constructor(client: ClientProxy);
    onModuleInit(): void;
    create(createCardDto: CreateCardDto): Promise<{
        id: string;
        available: boolean;
        commissionPercentage: number | null;
    } | {
        status: HttpStatus;
        message: string;
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        available: boolean;
        commissionPercentage: number | null;
    }[]> | {
        status: HttpStatus;
        message: string;
    };
    findOne(id: string): Promise<{
        id: string;
        available: boolean;
        commissionPercentage: number | null;
    } | {
        status: HttpStatus;
        message: string;
    } | null>;
    update(id: string, updateCardDto: UpdateCardDto): Promise<{
        id: string;
        available: boolean;
        commissionPercentage: number | null;
    } | import(".prisma/client").Prisma.BatchPayload | {
        status: HttpStatus;
        message: string;
    }>;
}
