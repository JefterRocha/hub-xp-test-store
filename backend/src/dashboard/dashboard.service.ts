import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from '../orders/schemas/order.schema';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';

@Injectable()
export class DashboardService {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}

  async getDashboardMetrics(filters: DashboardFilterDto): Promise<any> {
    const { categoryId, productId, startDate, endDate, period } = filters;

    const pipeline: any[] = [];

    if (startDate || endDate) {
      const dateFilter: any = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
      pipeline.push({ $match: { date: dateFilter } });
    }

    if (productId) {

      pipeline.push({ $match: { productIds: { $in: [new Types.ObjectId(productId)] } } });
    }

    if (categoryId) {
      pipeline.push(
        {
          $lookup: {
            from: 'products',
            localField: 'productIds',
            foreignField: '_id',
            as: 'products',
          },
        },
        {
          $match: {
            'products.categoryIds': { $in: [new Types.ObjectId(categoryId)] },
          },
        },
      );
    }

    if (period) {
      const dateFormat = {
        daily: '%Y-%m-%d',
        weekly: '%Y-%U',
        monthly: '%Y-%m',
      }[period] || '%Y-%m-%d';

      pipeline.push({
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$date' } },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
        },
      });
      pipeline.push({ $sort: { _id: 1 } });
    } else {
      pipeline.push({
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
        },
      });
    }

    const result = await this.orderModel.aggregate(pipeline).exec();

    if (period) {
      return result.map((item) => ({
        date: item._id,
        totalOrders: item.totalOrders || 0,
        totalRevenue: item.totalRevenue || 0,
        averageOrderValue: item.averageOrderValue || 0,
      }));
    } else {
      const [singleResult] = result;
      return {
        totalOrders: singleResult?.totalOrders || 0,
        totalRevenue: singleResult?.totalRevenue || 0,
        averageOrderValue: singleResult?.averageOrderValue || 0,
      };
    }
  }
}