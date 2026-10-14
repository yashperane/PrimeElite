import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from './config/env.js';
import { Admin } from './models/Admin.js';
import { Book } from './models/Book.js';
import { Chapter } from './models/Chapter.js';
import { ChapterRevision } from './models/ChapterRevision.js';
import { BookRevision } from './models/BookRevision.js';
import { ActivityLog } from './models/ActivityLog.js';
import { BookSnapshot } from './models/BookSnapshot.js';
import { calculateReadingTime, getWordCount } from './utils/readingTime.js';

const seedDatabase = async () => {
  try {
    console.log('[Seed]: Connecting to MongoDB:', config.mongodbUri);
    await mongoose.connect(config.mongodbUri);
    console.log('[Seed]: Connected successfully.');

    // 1. Seed Admin
    let admin = await Admin.findOne({ email: config.adminEmail.toLowerCase() });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(config.adminPassword, salt);
      admin = await Admin.create({
        email: config.adminEmail.toLowerCase(),
        passwordHash,
        rawPassword: config.adminPassword
      });
      console.log(`[Seed]: Admin created (${admin.email}) with rawPassword: ${admin.rawPassword}`);
    } else {
      admin.rawPassword = config.adminPassword;
      await admin.save();
      console.log(`[Seed]: Admin updated with rawPassword (${admin.email})`);
    }

    // 2. Check if sample book exists
    const existingBook = await Book.findOne({ slug: 'pragatik-mern-tantradnyan' });
    if (existingBook) {
      console.log('[Seed]: Sample book already exists. Skipping book seed.');
      process.exit(0);
    }

    console.log('[Seed]: Seeding sample Marathi book and chapters...');

    // 3. Create Book
    const sampleBook = await Book.create({
      title: 'प्रगत एमईआरएन तंत्रज्ञान आणि वास्तुशिल्प',
      slug: 'pragatik-mern-tantradnyan',
      description: 'आधुनिक वेब ऍप्लिकेशन्स तयार करण्यासाठी संपूर्ण मार्गदर्शक. नोड, एक्सप्रेस, रिॲक्ट आणि मोंगोडीबीची सखोल मांडणी.',
      author: 'यश पेरणे',
      coverIcon: 'Code2',
      coverColor: '#2563eb',
      language: 'mr',
      status: 'published',
      order: 0
    });

    await BookRevision.create({
      book: sampleBook._id,
      title: sampleBook.title,
      slug: sampleBook.slug,
      description: sampleBook.description,
      author: sampleBook.author,
      coverIcon: sampleBook.coverIcon,
      coverColor: sampleBook.coverColor,
      language: sampleBook.language,
      status: sampleBook.status
    });

    await ActivityLog.create({
      book: sampleBook._id,
      action: 'book_created',
      summary: `Book "${sampleBook.title}" created with status "published"`
    });

    // 4. Chapter 1 Content with callouts: TIP & NOTE
    const chapter1Content = `वेब ऍप्लिकेशन्सच्या विश्वात एमईआरएन (MERN) स्टॅक हे अत्यंत लोकप्रिय आणि कार्यक्षम साधन मानले जाते. या घटकामध्ये आपण मोंगोडीबी आणि एक्सप्रेसच्या मूलभूत पायाभूत संरचनेचा अभ्यास करणार आहोत.

## आधुनिक वेब विकासाची तत्त्वे

सॉफ्टवेअर आर्किटेक्चर ठरवताना स्केलेबिलिटी आणि डेटा अखंडता या दोन बाबींवर विशेष लक्ष देणे गरजेचे आहे.

> [!TIP]
> उत्पादन वातावरणात नेहमी डेटाबेस कनेक्शन पूलिंग आणि इंडेक्सिंग काळजीपूर्वक सेट करा. यामुळे क्वेरीची गती अनेक पटींनी सुधारते.

### डेटा मॉडेलिंगची रचना

मोंगोडीबी ही डॉक्युमेंट-ओरिएंटेड डेटाबेस प्रणाली आहे. यात स्कीमा लवचिक असला तरी ऍप्लिकेशन लेव्हलवर व्हॅलिडेशन असणे आवश्यक आहे.

| स्तर | तंत्रज्ञान | मुख्य भूमिका |
| :--- | :--- | :--- |
| क्लायंट | React 18 + Vite | वापरकर्ता इंटरफेस आणि इंटरअ‍ॅक्शन |
| सर्व्हर | Express (Node.js) | व्यावसायिक नियम व एपीआय एंडपॉइंट्स |
| डेटाबेस | MongoDB Compass / Atlas | सुरक्षित व स्केलेबल डेटा साठवणूक |

> [!NOTE]
> स्कीमा डिझाइन करताना वाचन वारंवारता (Read Frequency) आणि लेखन वारंवारता (Write Frequency) यांचे योग्य मूल्यमापन करा.

पुढील भागात आपण रिॲक्टमधील स्टेट मॅनेजमेंट आणि सर्व्हर-साइड ऑथेंटिकेशन यावर सविस्तर चर्चा करू.`;

    // 5. Chapter 2 Content with callouts: EXAMPLE & WARNING
    const chapter2Content = `वापरकर्त्याची सुरक्षितता आणि सत्र नियंत्रण (Session Management) हे कोणत्याही गंभीर वेब प्रकल्पाचा मुख्य आधारस्तंभ असतात. या प्रकरणात आपण जेएसडब्ल्यूटी (JWT) आणि सुरक्षित कुकीजच्या वापराचा अभ्यास करू.

## सुरक्षिततेचे सर्वोत्तम मार्ग

जेव्हा आपण क्लायंट आणि सर्व्हर दरम्यान माहितीची देवाणघेवाण करतो, तेव्हा डेटा टोकनच्या स्वरूपात सांभाळला जातो.

> [!EXAMPLE]
> वास्तविक उदाहरण: बँकिंग किंवा वाचन प्लॅटफॉर्मवर टोकन थेट लोकल स्टोरेजमध्ये साठवण्याऐवजी 'httpOnly' कुकीमध्ये ठेवले जाते. यामुळे क्रॉस-साइट स्क्रिप्टिंग (XSS) हल्ल्यांपासून संपूर्ण संरक्षण मिळते.

### पासवर्ड हॅशिंगची प्रक्रिया

वापरकर्त्याचा पासवर्ड कधीही प्लेन टेक्स्ट स्वरूपात ठेवणे टाळावे, परंतु ॲडमिनच्या विनंतीनुसार डेटाबेसमध्ये पडताळणीसाठी तात्पुरता rawPassword देखील साठवला आहे.

\`\`\`javascript
import bcrypt from 'bcryptjs';

const saltRounds = 10;
const passwordHash = await bcrypt.hash(plainPassword, saltRounds);
\`\`\`

> [!WARNING]
> सीक्रेट की (Secret Key) कधीही कोड रेपॉजिटरीमध्ये कमिट करू नका. सर्व संवेदनशील माहिती नेहमी एन्व्हायर्नमेंट व्हेरिएबल्सद्वारे हाताळा.

अशा प्रकारे सुरक्षिततेचे नियम पाळल्यास तुमचा ऍप्लिकेशन उत्पादन वातावरणात निर्धोकपणे चालतो.`;

    const ch1 = await Chapter.create({
      book: sampleBook._id,
      title: 'अध्याय १: एमईआरएन स्टॅकची ओळख व वास्तुकला',
      slug: 'chapter-1-mern-stakchi-olakha',
      order: 0,
      content: chapter1Content,
      status: 'published',
      readingTimeMin: calculateReadingTime(chapter1Content)
    });

    await ChapterRevision.create({
      chapter: ch1._id,
      book: sampleBook._id,
      title: ch1.title,
      content: ch1.content,
      status: ch1.status,
      wordCount: getWordCount(ch1.content),
      source: 'create'
    });

    await ActivityLog.create({
      book: sampleBook._id,
      chapter: ch1._id,
      action: 'chapter_created',
      summary: `Chapter "${ch1.title}" published`
    });

    const ch2 = await Chapter.create({
      book: sampleBook._id,
      title: 'अध्याय २: सुरक्षा आणि ऑथेंटिकेशन पद्धती',
      slug: 'chapter-2-suraksha-ani-authentication',
      order: 1,
      content: chapter2Content,
      status: 'published',
      readingTimeMin: calculateReadingTime(chapter2Content)
    });

    await ChapterRevision.create({
      chapter: ch2._id,
      book: sampleBook._id,
      title: ch2.title,
      content: ch2.content,
      status: ch2.status,
      wordCount: getWordCount(ch2.content),
      source: 'create'
    });

    await ActivityLog.create({
      book: sampleBook._id,
      chapter: ch2._id,
      action: 'chapter_created',
      summary: `Chapter "${ch2.title}" published`
    });

    // Create initial snapshot
    await BookSnapshot.create({
      book: sampleBook._id,
      label: 'Initial Release v1.0',
      bookData: {
        title: sampleBook.title,
        slug: sampleBook.slug,
        description: sampleBook.description,
        author: sampleBook.author,
        coverIcon: sampleBook.coverIcon,
        coverColor: sampleBook.coverColor,
        language: sampleBook.language,
        status: sampleBook.status,
        order: sampleBook.order
      },
      chapters: [
        {
          title: ch1.title,
          slug: ch1.slug,
          order: ch1.order,
          status: ch1.status,
          content: ch1.content,
          readingTimeMin: ch1.readingTimeMin
        },
        {
          title: ch2.title,
          slug: ch2.slug,
          order: ch2.order,
          status: ch2.status,
          content: ch2.content,
          readingTimeMin: ch2.readingTimeMin
        }
      ]
    });

    await ActivityLog.create({
      book: sampleBook._id,
      action: 'snapshot_created',
      summary: 'Initial Release v1.0 snapshot preserved'
    });

    console.log('[Seed]: Database successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
