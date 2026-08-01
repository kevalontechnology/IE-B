const Sequence = require('../models/Sequence');

class SequenceService {
  async getNextSequence(type, defaultPrefix = 'DOC-') {
    const currentYear = new Date().getFullYear();
    let seq = await Sequence.findOne({ type });

    if (!seq) {
      seq = await Sequence.create({
        type,
        prefix: defaultPrefix,
        year: currentYear,
        sequenceNumber: 1,
        padding: 6,
      });
    } else {
      if (seq.year !== currentYear) {
        seq.year = currentYear;
        seq.sequenceNumber = 1;
      } else {
        seq.sequenceNumber += 1;
      }
      await seq.save();
    }

    const paddedNumber = String(seq.sequenceNumber).padStart(seq.padding, '0');
    return `${seq.prefix}${seq.year}-${paddedNumber}`;
  }
}

module.exports = new SequenceService();
