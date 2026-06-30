module.exports = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`,
        requestId: req.id,
        timestamp: new Date().toISOString(),
    });
};