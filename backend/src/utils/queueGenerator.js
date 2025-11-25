// Generate sequential queue number based on today's active queues
export const generateQueueNumber = async () => {
  try {
    const db = await import('../models/Index.js');
    const { Op } = await import('sequelize');
    const { Queue } = db.default;

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find all queues today that are not completed (menunggu or dipanggil)
    const activeQueues = await Queue.findAll({
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        },
        status: {
          [Op.in]: ['menunggu', 'dipanggil']
        }
      },
      order: [['createdAt', 'ASC']]
    });

    // Get the next queue number (sequential based on active queues)
    const nextNumber = activeQueues.length + 1;
    
    return nextNumber; // Return just the number (1, 2, 3, etc.)
  } catch (err) {
    console.error('Error generating queue number:', err);
    // Fallback to timestamp-based if error
    const counter = new Date().getTime().toString().slice(-3);
    return parseInt(counter);
  }
};