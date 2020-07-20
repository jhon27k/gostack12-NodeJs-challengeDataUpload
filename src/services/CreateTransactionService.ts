import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';
import { getCustomRepository, getRepository } from 'typeorm';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    // TODO
    const transactionsRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);
    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('you do not have enough balance');
    }

    let transationCategory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!transationCategory) {
      transationCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(transationCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: transationCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
