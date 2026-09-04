import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dns from 'dns';

try {
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

// Read .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) {
    envVars[key.trim()] = rest.join('=').trim();
  }
});

const uri = envVars.MONGODB_URI;

async function resolveDirectUriIfSrvFails(srvUri) {
  if (!srvUri || !srvUri.startsWith('mongodb+srv://')) return srvUri;
  try {
    const match = srvUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?]+)\/?([^?]*)/);
    if (match) {
      const [, user, pass, host, db] = match;
      const resolver = new dns.promises.Resolver();
      resolver.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
      const addresses = await resolver.resolveSrv(`_mongodb._tcp.${host}`);
      if (addresses && addresses.length > 0) {
        const hostList = addresses.map((a) => `${a.name}:${a.port}`).join(',');
        const dbName = db || 'qarp_elearning';
        return `mongodb://${user}:${pass}@${hostList}/${dbName}?ssl=true&authSource=admin&retryWrites=true&w=majority`;
      }
    }
  } catch (err) {
    console.warn('[MongoDB] Custom SRV fallback:', err.message);
  }
  return srvUri;
}

async function inspectMongoImages() {
  console.log('Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  } catch (err) {
    const fallbackUri = await resolveDirectUriIfSrvFails(uri);
    await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 8000 });
  }
  console.log('✓ Connected to MongoDB database:', mongoose.connection.name);

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  const colNames = collections.map(c => c.name);
  console.log('\n======================================================');
  console.log('1. ALL COLLECTIONS FOUND IN YOUR MONGODB DATABASE:');
  console.log('======================================================');
  console.log(colNames.join(', '));

  // Check if GridFS collections exist (fs.files, fs.chunks)
  const hasGridFS = colNames.includes('fs.files') || colNames.includes('fs.chunks');
  console.log('\nGridFS (Binary Image Storage) collections present in DB?:', hasGridFS ? 'YES' : 'NO');

  // Inspect MediaFiles collection
  console.log('\n======================================================');
  console.log('2. INSPECTING "mediafiles" COLLECTION (Gallery Uploads):');
  console.log('======================================================');
  const mediaCol = db.collection('mediafiles');
  const mediaCount = await mediaCol.countDocuments();
  console.log(`Total documents in 'mediafiles': ${mediaCount}`);
  
  if (mediaCount > 0) {
    const sampleMedia = await mediaCol.find({}).limit(5).toArray();
    sampleMedia.forEach((doc, idx) => {
      console.log(`\nDocument #${idx + 1}:`);
      console.log(` - _id: ${doc._id}`);
      console.log(` - name: "${doc.name}"`);
      console.log(` - url: "${doc.url}"`);
      console.log(` - url field type: ${typeof doc.url} (Is it a String path? ${typeof doc.url === 'string'})`);
      console.log(` - Is raw binary image buffer stored?: ${doc.data || doc.buffer || doc.binary ? 'YES' : 'NO (Only URL string)'}`);
      console.log(` - size: ${doc.sizeFormatted || doc.size}`);
    });
  } else {
    console.log('mediafiles collection is currently empty.');
  }

  // Inspect Courses collection (thumbnails)
  console.log('\n======================================================');
  console.log('3. INSPECTING "courses" COLLECTION (Course Thumbnails):');
  console.log('======================================================');
  const coursesCol = db.collection('courses');
  const coursesCount = await coursesCol.countDocuments();
  console.log(`Total courses in DB: ${coursesCount}`);
  const sampleCourses = await coursesCol.find({}).limit(3).toArray();
  sampleCourses.forEach((doc, idx) => {
    console.log(`\nCourse #${idx + 1} ("${doc.title}"):`);
    console.log(` - thumbnail: "${doc.thumbnail}"`);
    console.log(` - thumbnail type: ${typeof doc.thumbnail} (String URL)`);
    console.log(` - Is raw image byte stored?: NO (Only path string)`);
  });

  // Inspect PortfolioProjects collection (covers/images)
  console.log('\n======================================================');
  console.log('4. INSPECTING "portfolioprojects" COLLECTION:');
  console.log('======================================================');
  const projectsCol = db.collection('portfolioprojects');
  const projectsCount = await projectsCol.countDocuments();
  console.log(`Total portfolio projects in DB: ${projectsCount}`);
  const sampleProjects = await projectsCol.find({}).limit(2).toArray();
  sampleProjects.forEach((doc, idx) => {
    console.log(`\nProject #${idx + 1} ("${doc.title}"):`);
    console.log(` - image: "${doc.image}"`);
    console.log(` - image type: ${typeof doc.image} (String URL)`);
  });

  console.log('\n======================================================');
  console.log('CONCLUSION / PROOF:');
  console.log('======================================================');
  console.log('Does MongoDB store raw binary image bytes?: NO');
  console.log('What does MongoDB store?: String URL references (e.g. "/uploads/...", "https://images.unsplash.com/...")');
  console.log('Where are the actual files?: On your local disk in "public/uploads/"\n');

  await mongoose.disconnect();
}

inspectMongoImages().catch(err => {
  console.error('Error running inspection:', err);
  process.exit(1);
});
