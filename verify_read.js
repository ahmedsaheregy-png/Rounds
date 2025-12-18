
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://antzuhakwgyuswjipmnf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFudHp1aGFrd2d5dXN3amlwbW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NjA4ODUsImV4cCI6MjA4MTIzNjg4NX0.xqhNrQk2hwMzCve2kpfhH0JeYXHhsMx1FEgWajydV3A';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkRead() {
    console.log("Checking fetching 'settings'...");
    const { data: settings, error: settingsError } = await supabase.from('settings').select('*');
    
    if (settingsError) {
        console.error("Settings Read Error:", settingsError);
    } else {
        console.log("Settings Data:", settings);
    }

    console.log("Checking fetching 'reservations'...");
    const { data: reservations, error: resError } = await supabase.from('reservations').select('*');

    if (resError) {
        console.error("Reservations Read Error:", resError);
    } else {
        console.log(`Reservations Count: ${reservations ? reservations.length : 0}`);
        if(reservations && reservations.length > 0) {
            console.log("First Reservation:", reservations[0]);
        }
    }
}

checkRead();
