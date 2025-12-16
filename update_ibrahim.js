
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://antzuhakwgyuswjipmnf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFudHp1aGFrd2d5dXN3amlwbW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NjA4ODUsImV4cCI6MjA4MTIzNjg4NX0.xqhNrQk2hwMzCve2kpfhH0JeYXHhsMx1FEgWajydV3A';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TARGET_NAME = 'ابراهيم العص';
const IMAGE_URL = 'https://ahmedsaheregy-png.github.io/partner/assets/ibrahim_alas.jpg';

async function updateImage() {
    console.log(`Searching for user: ${TARGET_NAME}...`);

    try {
        // 1. Find the user
        const { data: users, error: searchError } = await supabase
            .from('reservations')
            .select('*')
            .ilike('full_name', `%${TARGET_NAME}%`);

        if (searchError) throw searchError;

        if (!users || users.length === 0) {
            console.error('❌ User not found!');
            return;
        }

        console.log(`Found ${users.length} user(s). Updating...`);

        // 2. Update all matches
        for (const user of users) {
            const { error: updateError } = await supabase
                .from('reservations')
                .update({ avatar_url: IMAGE_URL })
                .eq('id', user.id);

            if (updateError) {
                console.error(`❌ Failed to update ${user.full_name} (${user.id}):`, updateError.message);
            } else {
                console.log(`✅ Updated ${user.full_name} (${user.id}) with image.`);
            }
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

updateImage();
