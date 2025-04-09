import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ConfigService } from '@nestjs/config';

import { SNS } from 'aws-sdk';
import { Order } from './schemas/order.schema';
import { Product } from '../products/schemas/product.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  private sns: SNS;
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private configService: ConfigService
  ) {
    this.sns = new SNS({
      region: this.configService.get<string>('AWS_REGION'),
      s3ForcePathStyle: true,
      endpoint: this.configService.get<string>('SNS_ENDPOINT'),
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
    });
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {

    const products = await this.productModel
      .find({ _id: { $in: createOrderDto.productIds } })
      .exec();

    if (products.length !== createOrderDto.productIds.length) {
      throw new NotFoundException('One or more products not found');
    }

    const total = products.reduce((sum, product) => sum + product.price, 0);

    const createdOrder = new this.orderModel({
      ...createOrderDto,
      date: new Date(),
      total
    });

    const savedOrder = await createdOrder.save();
    if (!savedOrder) {
      throw new NotFoundException('Error creating order');
    }
    const message = {
      orderId: savedOrder._id ? savedOrder._id.toString() : savedOrder._id
    };

    await this.sns
      .publish({
        TopicArn:this.configService.get<string>('SNS_TOPIC_ARN'),
        Message: JSON.stringify(message),
      })
      .promise();
    return savedOrder;
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().populate('productIds').exec();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).populate('productIds').exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {

    const products = await this.productModel
    .find({ _id: { $in: updateOrderDto.productIds } })
    .exec();

  if (updateOrderDto.productIds && updateOrderDto.productIds.length !== products.length) {
    throw new NotFoundException('One or more products not found');
  }

  const total = products.reduce((sum, product) => sum + product.price, 0);

    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(id, {...updateOrderDto, total}, { new: true })
      .populate('productIds')
      .exec();
    if (!updatedOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return updatedOrder;
  }

  async remove(id: string): Promise<boolean | void> {
    const result = await this.orderModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return true;
  }
}