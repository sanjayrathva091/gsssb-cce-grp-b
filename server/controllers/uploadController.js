const pdfParse = require('pdf-parse');
const Result = require('../models/Result');
const { extractResults } = require('../services/pdfParser');

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const data = await pdfParse(req.file.buffer);
    const results = extractResults(data.text);
    await Result.insertMany(results);

    res.json({
      success: true,
      count: results.length,
      sample: results[0] // Return first record for verification
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({
      error: 'Processing failed',
      details: err.message
    });
  }
};

exports.estimateMainsMarks = async (req, res) => {
  const CORRECT_AWARD = 1.02564;
  const WRONG_AWARD = -0.25641;
  try {
    const { pre_roll_no, right, wrong } = req.body;
    if (!pre_roll_no || right === undefined || wrong === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const docu = await Result.findOne({ rollNo: pre_roll_no });
    if (!docu) {
      return res.status(404).json({ error: 'Cadidate not found' });
    }
    if (docu.mainsMarks) {
      return res.status(400).json({ error: 'Mains marks already estimated' });
    }
    const est = right * CORRECT_AWARD + wrong * WRONG_AWARD;
    docu.mainsMarks = est.toString();
    await docu.save();
  } catch (err) {
    console.error('Estimate mains marks error:', err);
    res.status(500).json({
      error: 'Estimation failed',
      details: err.message
    });
  }
};

exports.getCandidate = async (req, res) => {
  try {
    const { rollNo } = req.body;
    const candidate = await Result.findOne({ rollNo });
    if (!candidate) {
      return res.status(404).json({ error: 'Missing candidate data.' });
    }
    return res.status(200).json({
      success: true,
      candidate
    });
  } catch (err) {
    console.error('Error fetching candidate:', err);
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
};

exports.fetchData = async (req, res) => {
  try {
    // Find documents where mainsMarks exists and is not null
    const results = await Result.find({ mainsMarks: { $exists: true, $ne: null } });
    
    res.status(200).json({
      success: true,
      count: results.length,
      results
    });
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
};