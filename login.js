const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

// Supabase logic
const supabaseUrl = 'https://uyvwcygovdqllqndixpj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5dndjeWdvdmRxbGxxbmRpeHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjQ2NjEsImV4cCI6MjA2NjI0MDY2MX0.udtcc1CR7nHYZGny4CHJWZPYEYzZRUA0UF04zbHYJT0';
let supabase;
try {
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
} catch (error) {
    alert('Gagal menginisialisasi Supabase. Periksa koneksi internet atau kredensial.');
}

// Login handler
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const userid = document.getElementById('userid').value.trim();
        const password = document.getElementById('password').value;
        
        if (!userid || !password) {
            alert('User ID dan Password harus diisi!');
            return;
        }

        try {
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('userid', userid)
                .single();

            if (error || !user) {
                alert('User ID tidak ditemukan!');
                return;
            }

            if (password === user.passw) { // Sementara plain text
                localStorage.setItem('user', JSON.stringify({ userid: user.userid, nama: user.nama }));
                window.location.href = 'index.html';
            } else {
                alert('Password salah!');
            }
        } catch (error) {
            alert('Gagal login: ' + error.message);
        }
    });
}

// Register handler
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const userid = document.getElementById('reg_userid').value.trim();
        const nama = document.getElementById('reg_nama').value.trim();
        const password = document.getElementById('reg_password').value;

        if (!userid || !nama || !password) {
            alert('Semua field harus diisi!');
            return;
        }

        try {
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('userid')
                .eq('userid', userid);

            if (checkError) {
                throw checkError;
            }

            if (existingUser.length > 0) {
                alert('User ID sudah terdaftar!');
                return;
            }

            const { error: insertError } = await supabase
                .from('users')
                .insert([{ userid, nama, passw: password }]);

            if (insertError) {
                throw insertError;
            }

            alert('Pendaftaran berhasil! Silakan login.');
            // Optionally, switch back to the login view
            container.classList.remove('active');
            document.getElementById('registerForm').reset();
        } catch (error) {
            alert('Gagal mendaftar: ' + error.message);
        }
    });
} 