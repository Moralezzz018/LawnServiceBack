const { Quote } = require('../../db/models');

let quoteSchemaReady = false;

async function ensureQuoteSchema() {
  if (quoteSchemaReady) return;
  await Quote.sync({ alter: true });
  quoteSchemaReady = true;
}

function sanitizeLineItems(items = []) {
  return items.map((item) => {
    const unitPrice = Number(item.unitPrice || 0);
    const quantity = Number(item.quantity || 0);
    const subtotal = Number((unitPrice * quantity).toFixed(2));

    return {
      serviceId: Number(item.serviceId),
      serviceName: String(item.serviceName),
      unit: String(item.unit),
      unitPrice,
      quantity,
      subtotal,
    };
  });
}

async function createQuote(req, res, next) {
  try {
    await ensureQuoteSchema();

    const lineItems = sanitizeLineItems(req.body.lineItems || []);
    const estimatedAmount = Number(
      lineItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0).toFixed(2)
    );

    const data = {
      clientFullName: req.body.clientFullName,
      phone: req.body.phone || null,
      email: req.body.email || null,
      serviceAddress: req.body.serviceAddress || null,
      serviceTypes: lineItems.map((item) => item.serviceName),
      lineItems,
      estimatedAmount,
      currency: req.body.currency || 'USD',
      status: req.body.status || 'DRAFT',
      notes: req.body.notes || null,
      attachmentPath: req.file?.path || null,
    };

    const quote = await Quote.create(data);

    return res.status(201).json({
      message: 'Quote created successfully',
      data: quote,
    });
  } catch (error) {
    return next(error);
  }
}

async function listQuotes(req, res, next) {
  try {
    await ensureQuoteSchema();

    const quotes = await Quote.findAll({
      order: [['createdAt', 'DESC']],
    });

    return res.json({ data: quotes });
  } catch (error) {
    return next(error);
  }
}

async function updateQuoteStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const quote = await Quote.findByPk(id);
    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    quote.status = status;
    await quote.save();

    return res.json({
      message: 'Quote status updated',
      data: quote,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createQuote,
  listQuotes,
  updateQuoteStatus,
};
