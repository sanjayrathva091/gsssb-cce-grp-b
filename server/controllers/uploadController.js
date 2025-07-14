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
    
    // Initialize stats structure
    const stats = {
      male: {},
      female: {},
      total: results.length
    };

    // Predefined categories (note: converted to lowercase once)
    const categories = ["general", "general(ews)", "sebc", "sc", "st", "exs", "ph-a", "ph-b", "ph-c", "ph-d"];
    
    // Initialize all category structures in one pass
    categories.forEach(category => {
      stats.male[category] = { count: 0, oneFiftyPlus: 0, oneThirtyPlus: 0, oneTenPlus: 0, ninetyPlus: 0 };
      stats.female[category] = { count: 0, oneFiftyPlus: 0, oneThirtyPlus: 0, oneTenPlus: 0, ninetyPlus: 0 };
    });

    // Single pass through results to collect all statistics
    results.forEach(result => {
      const categoryKey = result.category.toLowerCase();
      const genderKey = result.gender.toLowerCase() === 'm' ? 'male' : 'female';
      const marks = parseFloat(result.mainsMarks);
      
      // Skip if category doesn't exist in our predefined list
      if (!categories.includes(categoryKey)) return;
      
      // Increment basic count
      stats[genderKey][categoryKey].count++;
      
      // Check marks thresholds and increment counters
      if (marks >= 90) {
        stats[genderKey][categoryKey].ninetyPlus++;
        
        if (marks >= 110) {
          stats[genderKey][categoryKey].oneTenPlus++;
          
          if (marks >= 130) {
            stats[genderKey][categoryKey].oneThirtyPlus++;
            
            if (marks >= 150) {
              stats[genderKey][categoryKey].oneFiftyPlus++;
            }
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      count: results.length,
      stats
    });
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
};