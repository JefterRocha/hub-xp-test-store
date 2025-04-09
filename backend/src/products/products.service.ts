import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';

import { S3 } from 'aws-sdk';

import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  private s3: S3;

  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private configService: ConfigService
  ) {
    this.s3 = new S3({
      endpoint: this.configService.get<string>('S3_ENDPOINT'),
      s3ForcePathStyle: true,
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get<string>('AWS_REGION'),
    });
  }


  

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const params = {
      Bucket: 'prod-img-bkt',
      Key: `${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const { Location } = await this.s3.upload(params).promise();
    return Location;
  }

  async create(createProductDto: CreateProductDto, file: Express.Multer.File): Promise<Product> {
    const createdProduct = new this.productModel({
      ...createProductDto,
      price: parseFloat(createProductDto.price),
    });
    if (file) createdProduct.imageUrl = await this.uploadImage(file);
    if (!createdProduct) {
      throw new NotFoundException(`Error creating product`);
    }
    return await createdProduct.save();
  }

  async findAll(): Promise<Product[]> {
    const products = await this.productModel.find().populate('categoryIds').exec();
    if (!products) {
      throw new NotFoundException(`No products found`);
    }
    return products;
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).populate('categoryIds').exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, file: Express.Multer.File): Promise<Product> {
    if (file) updateProductDto.imageUrl = await this.uploadImage(file);
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, {
        ...updateProductDto,
        price: parseFloat(updateProductDto.price || '0'), 
      }, { new: true })
      .populate('categoryIds')
      .exec();
    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return updatedProduct;
  }

  async remove(id: string): Promise<boolean | void> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return true;
  }
}