// Initialize Supabase client
const supabaseUrl = 'https://uyvwcygovdqllqndixpj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5dndjeWdvdmRxbGxxbmRpeHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjQ2NjEsImV4cCI6MjA2NjI0MDY2MX0.udtcc1CR7nHYZGny4CHJWZPYEYzZRUA0UF04zbHYJT0'
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey)

// Navigation
document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi Supabase dengan benar
    const supabase = window.supabase.createClient(
        'https://uyvwcygovdqllqndixpj.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5dndjeWdvdmRxbGxxbmRpeHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjQ2NjEsImV4cCI6MjA2NjI0MDY2MX0.udtcc1CR7nHYZGny4CHJWZPYEYzZRUA0UF04zbHYJT0'
    );

    // Navigation handling
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    // Function untuk menampilkan section
    function showSection(targetId) {
        sections.forEach(section => {
            if (section.id === targetId) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
    }

    // Event listener untuk navigasi
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            showSection(targetId);
            
            // Load students hanya jika membuka section data mahasiswa
            if (targetId === 'mid-section') {
                loadStudents();
            }
        });
    });

    // Fungsi untuk memuat data mahasiswa
    async function loadStudents() {
        const tbody = document.querySelector('#studentTable tbody');
        
        try {
            const { data, error } = await supabase
                .from('students')
                .select('*');

            if (error) {
                console.error('Error fetching data:', error);
                throw error;
            }

            // Clear table
            tbody.innerHTML = '';

            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Tidak ada data mahasiswa</td></tr>';
                return;
            }

            // Populate table
            data.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.nim}</td>
                    <td>${student.nama}</td>
                    <td>${student.jurusan}</td>
                    <td>${student.angkatan}</td>
                    <td>
                        <button onclick="editStudent('${student.id}')" class="edit-btn">Edit</button>
                        <button onclick="deleteStudent('${student.id}')" class="delete-btn">Hapus</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        } catch (error) {
            console.error('Error:', error);
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Gagal memuat data</td></tr>';
        }
    }

    // Form handling
    const studentForm = document.getElementById('studentForm');
    
    studentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const editId = document.getElementById('editId').value;
        
        const studentData = {
            nim: document.getElementById('nim').value,
            nama: document.getElementById('nama').value,
            jurusan: document.getElementById('jurusan').value,
            angkatan: parseInt(document.getElementById('angkatan').value)
        };

        try {
            let response;
            
            if (editId) {
                // Update existing data
                response = await supabase
                    .from('students')
                    .update(studentData)
                    .eq('id', editId);
            } else {
                // Insert new data
                response = await supabase
                    .from('students')
                    .insert([studentData]);
            }

            if (response.error) throw response.error;

            // Reset form
            studentForm.reset();
            document.getElementById('editId').value = '';
            document.querySelector('button[type="submit"]').textContent = 'Simpan';
            
            // Reload data
            await loadStudents();
            
            alert(editId ? 'Data berhasil diupdate!' : 'Data berhasil ditambahkan!');
        } catch (error) {
            console.error('Error:', error);
            alert('Gagal menyimpan data: ' + error.message);
        }
    });

    // Edit function
    window.editStudent = async function(id) {
        try {
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            if (data) {
                // Fill form with data
                document.getElementById('editId').value = data.id;
                document.getElementById('nim').value = data.nim;
                document.getElementById('nama').value = data.nama;
                document.getElementById('jurusan').value = data.jurusan;
                document.getElementById('angkatan').value = data.angkatan;
                
                // Change button text
                document.querySelector('button[type="submit"]').textContent = 'Update';
                
                // Scroll to form
                document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Gagal memuat data untuk edit: ' + error.message);
        }
    };

    // Delete function
    window.deleteStudent = async function(id) {
        if (confirm('Yakin ingin menghapus data ini?')) {
            try {
                const { error } = await supabase
                    .from('students')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                await loadStudents();
                alert('Data berhasil dihapus!');
            } catch (error) {
                console.error('Error:', error);
                alert('Gagal menghapus data: ' + error.message);
            }
        }
    };

    // Initial load if on data section
    if (document.getElementById('mid-section').classList.contains('active')) {
        loadStudents();
    }
});
