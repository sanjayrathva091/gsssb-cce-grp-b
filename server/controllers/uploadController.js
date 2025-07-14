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
  const INCORRECT_AWARD = -0.25641;
  try {
    const { prelimRollNo, mainsRollNo, rightAnswers, wrongAnswers } = req.body;
    // Validate required fields
    if (!prelimRollNo || !mainsRollNo || rightAnswers === undefined || wrongAnswers === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const docu = await Result.findOne({ preRollNo: prelimRollNo });
    if (!docu) {
      return res.status(404).json({ error: 'Cadidate not found' });
    }
    if (docu.mainsMarks) {
      return res.status(400).json({ error: 'Mains marks already estimated' });
    }
    const est = rightAnswers * CORRECT_AWARD + wrongAnswers * INCORRECT_AWARD;
    docu.mainsMarks = est.toString();
    docu.mainsRollNo = mainsRollNo;
    const doc = await docu.save();
    return res.status(200).json({
      msg: "Updated mains marks successfully",
      success: true,
      data: doc
    })
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
    const { prelimRollNo } = req.params;
    const candidate = await Result.findOne({ preRollNo: prelimRollNo });

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