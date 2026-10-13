import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Flashcard, FlashcardSchema } from './schemas/flashcard.schema.js';
import { FlashcardsService } from './flashcards.service.js';
import { FlashcardsController } from './flashcards.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Flashcard.name, schema: FlashcardSchema },
    ]),
  ],
  controllers: [FlashcardsController],
  providers: [FlashcardsService],
  exports: [FlashcardsService],
})
export class FlashcardsModule {}
