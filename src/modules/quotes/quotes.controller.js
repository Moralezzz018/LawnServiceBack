const { Quote } = require('../../db/models');

async function createQuote(req, res, next) {
  try {
    const data = {
      clientFullName: req.body.clientFullName,
      phone: req.body.phone || null,
      email: req.body.email || null,
      serviceAddress: req.body.serviceAddress || null,
      serviceTypes: req.body.serviceTypes,
      estimatedAmount: req.body.estimatedAmount || null,
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
