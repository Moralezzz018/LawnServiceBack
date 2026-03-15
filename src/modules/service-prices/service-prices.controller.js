const { ServicePrice } = require('../../db/models');

const defaultServices = [
  { id: 1, name: 'General Lawn Service', icon: 'Scissors', price: 0, unit: 'per visit', isActive: true },
  { id: 2, name: 'Bush & Trees Trimming', icon: 'TreePine', price: 0, unit: 'per visit', isActive: true },
  { id: 3, name: 'Plants Remove', icon: 'Shovel', price: 0, unit: 'per visit', isActive: true },
  { id: 4, name: 'Mulching', icon: 'Layers', price: 0, unit: 'per sq ft', isActive: true },
  { id: 5, name: 'Flowers', icon: 'Flower2', price: 0, unit: 'per visit', isActive: true },
  { id: 6, name: 'Leaves Cleaning & More', icon: 'Wind', price: 0, unit: 'per visit', isActive: true },
];

async function ensureDefaults() {
  await ServicePrice.sync();

  const count = await ServicePrice.count();
  if (count > 0) return;
  await ServicePrice.bulkCreate(defaultServices);
}

function normalize(rows) {
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    icon: row.icon,
    price: Number(row.price),
    unit: row.unit,
    isActive: row.isActive,
    lastUpdated: row.updatedAt,
  }));
}

async function getServicePrices(req, res, next) {
  try {
    await ensureDefaults();

    const rows = await ServicePrice.findAll({ order: [['id', 'ASC']] });

    return res.json({ data: normalize(rows) });
  } catch (error) {
    return next(error);
  }
}

async function saveServicePrices(req, res, next) {
  try {
    const updates = req.body.services;

    await Promise.all(
      updates.map((item) =>
        ServicePrice.update(
          {
            price: Number(item.price),
            unit: item.unit,
            isActive: item.isActive,
          },
          {
            where: { id: item.id },
          }
        )
      )
    );

    const rows = await ServicePrice.findAll({ order: [['id', 'ASC']] });

    return res.json({
      message: 'Service prices updated successfully',
      data: normalize(rows),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getServicePrices,
  saveServicePrices,
};
