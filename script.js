// Navigation (letakkan di paling atas agar selalu berjalan)
const navLinks = document.querySelectorAll('.nav-menu a');
const sections = document.querySelectorAll('.section');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(targetId).classList.add('active');
    });
});

// Initialize Supabase client
const supabase = supabase.createClient(
    'https://uyvwcygovdqllqndixpj.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5dndjeWdvdmRxbGxxbmRpeHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjQ2NjEsImV4cCI6MjA2NjI0MDY2MX0.udtcc1CR7nHYZGny4CHJWZPYEYzZRUA0UF04zbHYJT0'
);

// CRUD Operations
const studentForm = document.getElementById('studentForm');
const studentTable = document.getElementById('studentTable').querySelector('tbody');

async function loadStudents() {
    try {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        studentTable.innerHTML = '';
        
        if (!data || data.length === 0) {
            studentTable.innerHTML = '<tr><td colspan="4">Tidak ada data mahasiswa</td></tr>';
            return;
        }

        data.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.nim}</td>
                <td>${student.nama}</td>
                <td>${student.jurusan}</td>
                <td>
                    <button onclick="editStudent(${student.id})" class="edit-btn">Edit</button>
                    <button onclick="deleteStudent(${student.id})" class="delete-btn">Hapus</button>
                </td>
            `;
            studentTable.appendChild(row);
        });
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal memuat data mahasiswa');
    }
}

if (studentForm) {
    studentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('editId').value;
        const studentData = {
            nim: document.getElementById('nim').value,
            nama: document.getElementById('nama').value,
            jurusan: document.getElementById('jurusan').value
        };

        try {
            let error;
            if (id) {
                // Update
                const { error: updateError } = await supabase
                    .from('students')
                    .update(studentData)
                    .eq('id', id);
                error = updateError;
            } else {
                // Insert
                const { error: insertError } = await supabase
                    .from('students')
                    .insert([studentData]);
                error = insertError;
            }

            if (error) throw error;

            studentForm.reset();
            document.getElementById('editId').value = '';
            document.getElementById('submitBtn').textContent = 'Simpan';
            loadStudents();
        } catch (error) {
            console.error('Error:', error);
            alert('Gagal menyimpan data mahasiswa');
        }
    });
}

window.editStudent = async function(id) {
    try {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        document.getElementById('editId').value = data.id;
        document.getElementById('nim').value = data.nim;
        document.getElementById('nama').value = data.nama;
        document.getElementById('jurusan').value = data.jurusan;
        document.getElementById('submitBtn').textContent = 'Update';
        
        // Switch to form section
        sections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById('mid-section').classList.add('active');
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal memuat data mahasiswa untuk diedit');
    }
}

window.deleteStudent = async function(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
        try {
            const { error } = await supabase
                .from('students')
                .delete()
                .eq('id', id);

            if (error) throw error;

            loadStudents();
        } catch (error) {
            console.error('Error:', error);
            alert('Gagal menghapus data mahasiswa');
        }
    }
}

// Initial load
loadStudents();
