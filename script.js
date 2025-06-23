// Navigation (letakkan di paling atas agar selalu berjalan)
const navLinks = document.querySelectorAll('.nav-menu a');
const sections = document.querySelectorAll('.section');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('data-section');
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === sectionId) {
                section.classList.add('active');
            }
        });
    });
});

// Initialize Supabase client
const supabase = Supabase.createClient(
    'https://uyvwcygovdqllqndixpj.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5dndjeWdvdmRxbGxxbmRpeHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjQ2NjEsImV4cCI6MjA2NjI0MDY2MX0.udtcc1CR7nHYZGny4CHJWZPYEYzZRUA0UF04zbHYJT0'
);

// CRUD Operations
const studentForm = document.getElementById('studentForm');
const studentTable = document.getElementById('studentTable').querySelector('tbody');

async function fetchStudents() {
    try {
        const { data, error } = await supabase
            .from('students')
            .select('*');
        if (error) throw error;
        if (!data) {
            studentTable.innerHTML = '<tr><td colspan="5">Tidak ada data</td></tr>';
            return;
        }
        renderTable(data);
    } catch (error) {
        console.error('Failed to fetch students:', error);
        studentTable.innerHTML = '<tr><td colspan="5">Gagal mengambil data mahasiswa</td></tr>';
    }
}

function renderTable(students) {
    studentTable.innerHTML = '';
    if (!students || students.length === 0) {
        studentTable.innerHTML = '<tr><td colspan="5">Tidak ada data</td></tr>';
        return;
    }
    students.forEach((student) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.nim}</td>
            <td>${student.nama}</td>
            <td>${student.jurusan}</td>
            <td>${student.angkatan}</td>
            <td class="action-buttons">
                <button class="edit-btn" onclick="editStudent(${student.id}, '${student.nim}', '${student.nama}', '${student.jurusan}', ${student.angkatan})">Edit</button>
                <button class="delete-btn" onclick="deleteStudent(${student.id})">Hapus</button>
            </td>
        `;
        studentTable.appendChild(row);
    });
}

if (studentForm) {
    studentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const editId = document.getElementById('editId').value;
        const student = {
            nim: document.getElementById('nim').value,
            nama: document.getElementById('nama').value,
            jurusan: document.getElementById('jurusan').value,
            angkatan: parseInt(document.getElementById('angkatan').value)
        };

        if (!student.nim || !student.nama || !student.jurusan || !student.angkatan) {
            alert('Semua field wajib diisi!');
            return;
        }

        try {
            if (editId) {
                const { error } = await supabase
                    .from('students')
                    .update(student)
                    .eq('id', editId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('students')
                    .insert([student]);
                if (error) throw error;
            }
            studentForm.reset();
            document.getElementById('editId').value = '';
            fetchStudents();
        } catch (error) {
            console.error('Error saving student:', error);
            alert('Error saving student');
        }
    });
}

window.editStudent = function(id, nim, nama, jurusan, angkatan) {
    document.getElementById('editId').value = id;
    document.getElementById('nim').value = nim;
    document.getElementById('nama').value = nama;
    document.getElementById('jurusan').value = jurusan;
    document.getElementById('angkatan').value = angkatan;
}

window.deleteStudent = async function(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
        try {
            const { error } = await supabase
                .from('students')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchStudents();
        } catch (error) {
            console.error('Error deleting student:', error);
            alert('Error deleting student');
        }
    }
}

// Initial render
fetchStudents();