const SearchIndexManager = require('./createSearchIndex');

async function recreateIndex() {
  const manager = new SearchIndexManager();
  
  try {
    console.log('🗑️ Deleting existing index...');
    await manager.deleteIndex();
    
    console.log('⏳ Waiting 2 seconds for deletion to complete...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🔧 Creating new index with vector support...');
    await manager.createIndex();
    
    console.log('✅ Index recreated successfully with vector support!');
  } catch (error) {
    console.error('❌ Error recreating index:', error.message);
    process.exit(1);
  }
}

recreateIndex();