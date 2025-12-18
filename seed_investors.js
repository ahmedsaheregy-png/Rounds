
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://antzuhakwgyuswjipmnf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFudHp1aGFrd2d5dXN3amlwbW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NjA4ODUsImV4cCI6MjA4MTIzNjg4NX0.xqhNrQk2hwMzCve2kpfhH0JeYXHhsMx1FEgWajydV3A';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const investors = [
    {
        full_name: 'أ.إبراهيم العص',
        shares: 1,
        avatar_url: 'https://ahmedsaheregy-png.github.io/partner/assets/ibrahim_alas.jpg'
    },
    {
        full_name: 'أ.صهيب درع',
        shares: 1,
        avatar_url: 'https://ahmedsaheregy-png.github.io/partner/assets/suhaib_v2.jpg'
    },
    {
        full_name: 'أ.كاوا جوي',
        shares: 1,
        avatar_url: 'https://ahmedsaheregy-png.github.io/partner/assets/kawa_v1.jpg'
    },
    {
        full_name: 'أ. أحمد شكري',
        shares: 1,
        avatar_url: 'https://ahmedsaheregy-png.github.io/partner/assets/ahmed_shukri.jpg'
    },
    {
        full_name: 'أ. أحمد عمار',
        shares: 1,
        avatar_url: 'https://ahmedsaheregy-png.github.io/partner/assets/ahmed_ammar.jpg'
    },
    {
        full_name: 'رزان صهيب',
        shares: 1,
        avatar_url: null
    },
    {
        full_name: 'عدنان رامي',
        shares: 1,
        avatar_url: null
    }
];

async function seedInvestors() {
    console.log('Seeding investors...');

    for (const investor of investors) {
        try {
            // Check if exists by name (fuzzy) or phone? Name is best effort here.
            const { data: existing, error: searchError } = await supabase
                .from('reservations')
                .select('id')
                .ilike('full_name', investor.full_name)
                .single();

            if (existing) {
                console.log(`User ${investor.full_name} exists. Updating...`);
                await supabase.from('reservations').update({
                    shares: investor.shares,
                    avatar_url: investor.avatar_url,
                    visible: true,
                    privacy: 'full'
                }).eq('id', existing.id);
            } else {
                console.log(`User ${investor.full_name} not found. Inserting...`);
                await supabase.from('reservations').insert({
                    full_name: investor.full_name,
                    phone: 'System Added', // Placeholder
                    shares: investor.shares,
                    privacy: 'full',
                    visible: true,
                    avatar_url: investor.avatar_url
                });
            }
        } catch (err) {
            console.error(`Error processing ${investor.full_name}:`, err.message);
        }
    }
    console.log('Investors seeding done.');
}

async function seedSettings() {
    console.log('Seeding settings...');

    try {
        // Check if settings exist
        const { data: existing, error } = await supabase
            .from('settings')
            .select('id')
            .single();

        const settingsData = {
            total_shares: 1000,
            share_price: 500,
            is_round_open: true,
            allow_images: true,
            display_mode: 'full'
        };

        if (existing) {
            console.log('Settings exist. Updating...');
            await supabase.from('settings')
                .update(settingsData)
                .eq('id', existing.id);
        } else {
            console.log('Settings not found. Inserting...');
            await supabase.from('settings').insert(settingsData);
        }
        console.log('Settings seeding done.');
    } catch (err) {
        console.error('Error seeding settings:', err.message);
    }
}

async function seedAll() {
    await seedSettings();
    await seedInvestors();
    console.log('All seeding complete! ✅');
}

seedAll();

