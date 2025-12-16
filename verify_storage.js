
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://antzuhakwgyuswjipmnf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFudHp1aGFrd2d5dXN3amlwbW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NjA4ODUsImV4cCI6MjA4MTIzNjg4NX0.xqhNrQk2hwMzCve2kpfhH0JeYXHhsMx1FEgWajydV3A';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    console.log('Checking Supabase Storage...');

    try {
        // 1. Check if we can access the 'avatars' bucket
        // attempting to list files at root
        const { data: files, error: listError } = await supabase
            .storage
            .from('avatars')
            .list();

        if (listError) {
            console.error('❌ Listing failed:', listError.message);
            if (listError.message.includes('not found')) {
                console.log('-> This likely means the bucket "avatars" does NOT exist.');
            } else if (listError.message.includes('row-level security policy')) {
                console.log('-> RLS Policy prevents listing. This might be fine if writing is allowed, but usually you want public read.');
            }
        } else {
            console.log('✅ Bucket "avatars" access confirmed. Files found:', files.length);
        }

        // 2. Try to upload a dummy test file
        const testFileName = `test_${Date.now()}.txt`;
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('avatars')
            .upload(testFileName, 'test content', { upsert: true });

        if (uploadError) {
            console.error('❌ Upload test failed:', uploadError.message);
            console.log('-> You likely need to create the bucket or set "Public" policy for INSERT.');
        } else {
            console.log('✅ Upload test passed. File:', testFileName);

            // Cleanup
            await supabase.storage.from('avatars').remove([testFileName]);
            console.log('✅ Cleanup passed.');
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

check();
