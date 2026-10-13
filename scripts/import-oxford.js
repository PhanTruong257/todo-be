import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-db';

async function run() {
  console.log('🚀 Đang kết nối tới MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Đã kết nối MongoDB thành công!');

  const db = mongoose.connection.db;
  const collection = db.collection('flashcards');

  console.log('📥 Đang tải Oxford 5000 JSON (5,944 từ)...');
  const oxfordRes = await fetch(
    'https://raw.githubusercontent.com/winterdl/oxford-5000-vocabulary-audio-definition/master/data/oxford_5000.json'
  );
  const oxfordData = await oxfordRes.json();
  const oxfordKeys = Object.keys(oxfordData);
  console.log(`✅ Đã tải ${oxfordKeys.length} từ Oxford 5000!`);

  console.log('📥 Đang tải Từ điển Anh - Việt để đối chiếu nghĩa tiếng Việt...');
  const dictRes = await fetch(
    'https://raw.githubusercontent.com/manhminno/English-Vietnamese-Dictionary/master/data/english-vietnamese.txt'
  );
  const dictText = await dictRes.text();
  const dictLines = dictText.split('\n');

  console.log('⚙️ Đang xử lý đối chiếu từ điển...');
  const viDict = new Map();
  let currentWord = null;

  for (const line of dictLines) {
    if (line.startsWith('@')) {
      const match = line.slice(1).trim().split(' ')[0];
      currentWord = match ? match.toLowerCase() : null;
    } else if (currentWord && !viDict.has(currentWord) && line.trim().startsWith('-')) {
      viDict.set(currentWord, line.trim().slice(1).trim());
    }
  }
  console.log(`✅ Đã xử lý ${viDict.size} mục từ điển Anh - Việt!`);

  const todayStr = new Date().toISOString().split('T')[0];
  const bulkOps = [];
  const processedWords = new Set();
  let countA1 = 0;
  let countA2 = 0;
  let countB1 = 0;
  let countB2 = 0;
  let countC1 = 0;

  for (const key of oxfordKeys) {
    const item = oxfordData[key];
    if (!item || !item.word) continue;

    const word = item.word.toLowerCase().trim();
    if (processedWords.has(word)) continue;
    processedWords.add(word);

    const cefr = (item.cefr || 'b1').toUpperCase();
    if (cefr === 'A1') countA1++;
    else if (cefr === 'A2') countA2++;
    else if (cefr === 'B1') countB1++;
    else if (cefr === 'B2') countB2++;
    else if (cefr === 'C1') countC1++;

    const topic = ['A1', 'A2', 'B1', 'B2'].includes(cefr)
      ? 'Oxford 3000'
      : 'Oxford 5000';

    // Nghĩa tiếng Việt: lấy từ viDict nếu có, hoặc dùng định nghĩa tiếng Anh
    let meaningVi = viDict.get(word) || '';
    if (!meaningVi) {
      meaningVi = item.definition || word;
    }

    const doc = {
      word,
      ipa: item.phon_n_am || item.phon_br || '',
      partOfSpeech: item.type || 'noun',
      meaningVi,
      meaningEn: item.definition || '',
      exampleEn: item.example || '',
      exampleVi: '',
      audioUrl: '',
      topic,
      level: cefr,
      studentName: 'all',
      repetition: 0,
      intervalDays: 0,
      easeFactor: 2.5,
      nextReviewDate: todayStr,
      status: 'new',
      updatedAt: new Date(),
    };

    bulkOps.push({
      updateOne: {
        filter: { word, studentName: 'all' },
        update: {
          $setOnInsert: {
            createdAt: new Date(),
          },
          $set: doc,
        },
        upsert: true,
      },
    });
  }

  console.log(`📦 Bắt đầu lưu ${bulkOps.length} từ vựng vào MongoDB Atlas...`);
  // Thực hiện theo batch 1000 items để tối ưu tốc độ
  const batchSize = 1000;
  for (let i = 0; i < bulkOps.length; i += batchSize) {
    const batch = bulkOps.slice(i, i + batchSize);
    await collection.bulkWrite(batch, { ordered: false });
    console.log(`  ➔ Đã lưu ${Math.min(i + batchSize, bulkOps.length)} / ${bulkOps.length} từ...`);
  }

  console.log('\n🎉 HOÀN THÀNH NHẬP KHO TỪ VỰNG OXFORD 3000 & 5000:');
  console.log(`- Tổng số từ vựng: ${bulkOps.length}`);
  console.log(`- Cấp độ A1 (Căn bản): ${countA1}`);
  console.log(`- Cấp độ A2 (Sơ cấp): ${countA2}`);
  console.log(`- Cấp độ B1 (Trung cấp): ${countB1}`);
  console.log(`- Cấp độ B2 (Khá): ${countB2}`);
  console.log(`- Cấp độ C1 (Nâng cao): ${countC1}`);

  await mongoose.disconnect();
  console.log('✅ Đã đóng kết nối MongoDB.');
}

run().catch((err) => {
  console.error('❌ Lỗi khi nhập kho từ vựng:', err);
  process.exit(1);
});
