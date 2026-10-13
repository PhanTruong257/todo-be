import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-db';

// Bộ từ khóa phân loại chủ đề thông minh dựa trên cả tiếng Anh và tiếng Việt
const TOPIC_RULES = [
  {
    topic: 'Environment & Nature',
    icon: '🌿',
    nameVi: 'Môi trường & Thiên nhiên',
    keywords: [
      'environment', 'nature', 'climate', 'weather', 'planet', 'earth', 'water', 'ocean',
      'sea', 'river', 'forest', 'tree', 'plant', 'animal', 'pollution', 'green', 'species',
      'wildlife', 'ecology', 'biodiversity', 'solar', 'wind', 'recycle', 'waste', 'rain',
      'môi trường', 'thiên nhiên', 'thời tiết', 'khí hậu', 'đất', 'nước', 'rừng', 'cây',
      'động vật', 'thực vật', 'ô nhiễm', 'sinh thái', 'tái chế', 'rác', 'mưa', 'bão'
    ],
  },
  {
    topic: 'Science & Technology',
    icon: '💻',
    nameVi: 'Khoa học & Công nghệ',
    keywords: [
      'computer', 'software', 'hardware', 'internet', 'web', 'digital', 'tech', 'technology',
      'data', 'code', 'online', 'phone', 'device', 'network', 'machine', 'electronic',
      'science', 'scientific', 'robot', 'algorithm', 'screen', 'media', 'app', 'virtual',
      'máy tính', 'công nghệ', 'khoa học', 'phần mềm', 'mạng', 'dữ liệu', 'kỹ thuật số',
      'điện tử', 'thiết bị', 'thuật toán', 'ứng dụng', 'màn hình'
    ],
  },
  {
    topic: 'Work & Business',
    icon: '💼',
    nameVi: 'Công việc & Kinh doanh',
    keywords: [
      'work', 'job', 'career', 'office', 'company', 'business', 'money', 'finance', 'financial',
      'market', 'trade', 'economy', 'economic', 'salary', 'income', 'cost', 'price', 'sell',
      'buy', 'customer', 'client', 'employee', 'employer', 'manager', 'bank', 'invest',
      'profit', 'tax', 'commerce', 'industry', 'hire', 'contract', 'corporate',
      'công việc', 'kinh doanh', 'nghề nghiệp', 'công ty', 'tiền', 'tài chính', 'thị trường',
      'kinh tế', 'lương', 'thu nhập', 'chi phí', 'giá', 'bán', 'mua', 'khách hàng', 'nhân viên',
      'quản lý', 'ngân hàng', 'đầu tư', 'lợi nhuận', 'thuế', 'hợp đồng'
    ],
  },
  {
    topic: 'Education & Academic',
    icon: '🎓',
    nameVi: 'Giáo dục & Học tập',
    keywords: [
      'education', 'school', 'university', 'college', 'study', 'student', 'teacher', 'professor',
      'class', 'classroom', 'lesson', 'course', 'learn', 'teach', 'exam', 'test', 'academic',
      'research', 'degree', 'grade', 'knowledge', 'book', 'read', 'library', 'lecture',
      'giáo dục', 'trường', 'học', 'học sinh', 'sinh viên', 'giáo viên', 'bài học', 'khóa học',
      'thi', 'nghiên cứu', 'bằng cấp', 'điểm', 'kiến thức', 'sách', 'thư viện', 'bài giảng'
    ],
  },
  {
    topic: 'Health & Medicine',
    icon: '🏥',
    nameVi: 'Sức khỏe & Y tế',
    keywords: [
      'health', 'healthy', 'medical', 'medicine', 'hospital', 'doctor', 'nurse', 'patient',
      'disease', 'illness', 'sick', 'virus', 'infection', 'pain', 'drug', 'treatment',
      'cure', 'surgery', 'body', 'physical', 'mental', 'fitness', 'diet', 'vitamin',
      'sức khỏe', 'y tế', 'thuốc', 'bệnh viện', 'bác sĩ', 'y tá', 'bệnh nhân', 'bệnh',
      'ốm', 'nhiễm trùng', 'đau', 'điều trị', 'chữa', 'phẫu thuật', 'cơ thể', 'thể chất'
    ],
  },
  {
    topic: 'Travel & Transport',
    icon: '✈️',
    nameVi: 'Du lịch & Giao thông',
    keywords: [
      'travel', 'trip', 'journey', 'tour', 'tourism', 'tourist', 'visit', 'visitor', 'hotel',
      'flight', 'airport', 'plane', 'train', 'bus', 'car', 'vehicle', 'traffic', 'road',
      'street', 'transport', 'ticket', 'station', 'map', 'passport', 'luggage', 'holiday',
      'du lịch', 'chuyến đi', 'khách du lịch', 'khách sạn', 'chuyến bay', 'sân bay', 'máy bay',
      'tàu', 'xe buýt', 'xe hơi', 'giao thông', 'đường', 'vé', 'nhà ga', 'bản đồ', 'hộ chiếu'
    ],
  },
  {
    topic: 'Food & Cooking',
    icon: '🍔',
    nameVi: 'Ẩm thực & Nấu nướng',
    keywords: [
      'food', 'cook', 'cooking', 'eat', 'drink', 'meal', 'dish', 'restaurant', 'cafe',
      'breakfast', 'lunch', 'dinner', 'meat', 'fish', 'vegetable', 'fruit', 'bread', 'rice',
      'sugar', 'salt', 'taste', 'delicious', 'bake', 'recipe', 'kitchen', 'hunger', 'thirsty',
      'thực phẩm', 'thức ăn', 'nấu', 'ăn', 'uống', 'bữa ăn', 'món ăn', 'nhà hàng', 'quán cà phê',
      'bữa sáng', 'bữa trưa', 'bữa tối', 'thịt', 'cá', 'rau', 'trái cây', 'bánh mì', 'cơm',
      'đường', 'muối', 'vị', 'ngon', 'bếp'
    ],
  },
  {
    topic: 'People & Relationships',
    icon: '👥',
    nameVi: 'Con người & Mối quan hệ',
    keywords: [
      'person', 'people', 'human', 'man', 'woman', 'child', 'children', 'family', 'parent',
      'father', 'mother', 'brother', 'sister', 'friend', 'relationship', 'marriage', 'marry',
      'husband', 'wife', 'neighbor', 'community', 'society', 'social', 'crowd', 'citizen',
      'con người', 'người', 'đàn ông', 'phụ nữ', 'trẻ em', 'gia đình', 'cha', 'mẹ', 'anh', 'em',
      'bạn bè', 'mối quan hệ', 'hôn nhân', 'chồng', 'vợ', 'hàng xóm', 'cộng đồng', 'xã hội'
    ],
  },
  {
    topic: 'Feelings & Emotions',
    icon: '💖',
    nameVi: 'Cảm xúc & Tâm lý',
    keywords: [
      'feel', 'feeling', 'emotion', 'emotional', 'happy', 'happiness', 'sad', 'sadness',
      'angry', 'anger', 'love', 'hate', 'fear', 'afraid', 'worry', 'worried', 'anxious',
      'anxiety', 'stress', 'joy', 'hope', 'proud', 'pride', 'calm', 'peace', 'mood',
      'cảm xúc', 'cảm thấy', 'hạnh phúc', 'buồn', 'giận', 'yêu', 'ghét', 'sợ', 'lo lắng',
      'căng thẳng', 'vui vẻ', 'hy vọng', 'tự hào', 'bình tĩnh', 'tâm trạng'
    ],
  },
  {
    topic: 'Law, Politics & Society',
    icon: '⚖️',
    nameVi: 'Pháp luật & Chính trị',
    keywords: [
      'law', 'legal', 'illegal', 'court', 'judge', 'lawyer', 'police', 'crime', 'criminal',
      'prison', 'jail', 'government', 'govern', 'politics', 'political', 'politician', 'policy',
      'vote', 'election', 'president', 'minister', 'rights', 'justice', 'protest', 'rule',
      'luật', 'pháp luật', 'tòa án', 'thẩm phán', 'luật sư', 'cảnh sát', 'tội phạm', 'tù',
      'chính phủ', 'chính trị', 'chính sách', 'bầu cử', 'tổng thống', 'quyền', 'công lý'
    ],
  },
  {
    topic: 'Arts & Entertainment',
    icon: '🎨',
    nameVi: 'Nghệ thuật & Giải trí',
    keywords: [
      'art', 'artist', 'artistic', 'music', 'musical', 'song', 'sing', 'singer', 'dance',
      'dancer', 'film', 'movie', 'cinema', 'theatre', 'actor', 'actress', 'paint', 'painting',
      'picture', 'draw', 'drawing', 'culture', 'cultural', 'entertainment', 'performance',
      'nghệ thuật', 'nghệ sĩ', 'âm nhạc', 'bài hát', 'hát', 'ca sĩ', 'múa', 'nhảy', 'phim',
      'rạp chiếu phim', 'nhà hát', 'diễn viên', 'vẽ', 'tranh', 'văn hóa', 'giải trí'
    ],
  },
  {
    topic: 'Sports & Leisure',
    icon: '⚽',
    nameVi: 'Thể thao & Vui chơi',
    keywords: [
      'sport', 'sports', 'game', 'play', 'player', 'football', 'soccer', 'basketball',
      'tennis', 'swim', 'swimming', 'run', 'runner', 'race', 'match', 'win', 'winner',
      'lose', 'champion', 'championship', 'stadium', 'hobby', 'gym', 'exercise', 'train',
      'thể thao', 'trò chơi', 'chơi', 'cầu thủ', 'bóng đá', 'bóng rổ', 'quần vợt', 'bơi',
      'chạy', 'đua', 'trận đấu', 'thắng', 'thua', 'vô địch', 'sân vận động', 'sở thích', 'tập'
    ],
  },
];

function classifyWord(word, meaningVi, meaningEn, exampleEn) {
  const text = `${word} ${meaningVi} ${meaningEn} ${exampleEn}`.toLowerCase();

  for (const rule of TOPIC_RULES) {
    for (const kw of rule.keywords) {
      // Tìm từ khóa nguyên từ hoặc cụm từ
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(text) || text.includes(kw)) {
        return rule.topic;
      }
    }
  }

  return 'General & Communication'; // Mặc định nếu không rơi vào các nhóm chuyên biệt
}

async function run() {
  console.log('🚀 Đang kết nối tới MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Đã kết nối MongoDB thành công!');

  const db = mongoose.connection.db;
  const collection = db.collection('flashcards');

  console.log('🔍 Đang lấy toàn bộ thẻ từ vựng từ database...');
  const cards = await collection.find({}).toArray();
  console.log(`📦 Tìm thấy ${cards.length} thẻ từ vựng.`);

  const bulkOps = [];
  const topicCounts = {};

  for (const card of cards) {
    const assignedTopic = classifyWord(
      card.word,
      card.meaningVi || '',
      card.meaningEn || '',
      card.exampleEn || ''
    );

    topicCounts[assignedTopic] = (topicCounts[assignedTopic] || 0) + 1;

    bulkOps.push({
      updateOne: {
        filter: { _id: card._id },
        update: {
          $set: {
            topic: assignedTopic,
          },
        },
      },
    });
  }

  console.log(`⚙️ Bắt đầu cập nhật chủ đề cho ${bulkOps.length} từ...`);
  const batchSize = 1000;
  for (let i = 0; i < bulkOps.length; i += batchSize) {
    const batch = bulkOps.slice(i, i + batchSize);
    await collection.bulkWrite(batch, { ordered: false });
    console.log(`  ➔ Đã phân loại ${Math.min(i + batchSize, bulkOps.length)} / ${bulkOps.length} từ...`);
  }

  console.log('\n📊 THỐNG KÊ PHÂN LOẠI TỪ VỰNG THEO CHỦ ĐỀ THỰC TẾ:');
  for (const [top, count] of Object.entries(topicCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`- ${top}: ${count} từ`);
  }

  await mongoose.disconnect();
  console.log('\n✅ Đã hoàn tất cập nhật chủ đề và đóng kết nối MongoDB.');
}

run().catch((err) => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
