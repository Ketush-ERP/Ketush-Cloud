import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
export declare class CardController {
    private readonly cardService;
    constructor(cardService: CardService);
    create(createCardDto: CreateCardDto): Promise<{
        id: string;
        available: boolean;
        commissionPercentage: number | null;
    } | {
        status: import("@nestjs/common").HttpStatus;
        message: string;
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        available: boolean;
        commissionPercentage: number | null;
    }[]> | {
        status: import("@nestjs/common").HttpStatus;
        message: string;
    };
    findOne(id: string): Promise<{
        id: string;
        available: boolean;
        commissionPercentage: number | null;
    } | {
        status: import("@nestjs/common").HttpStatus;
        message: string;
    } | null>;
    update(updateCardDto: UpdateCardDto): Promise<{
        id: string;
        available: boolean;
        commissionPercentage: number | null;
    } | import(".prisma/client").Prisma.BatchPayload | {
        status: import("@nestjs/common").HttpStatus;
        message: string;
    }>;
}
