// Initialize Supabase client
const supabaseUrl = 'https://uyvwcygovdqllqndixpj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5dndjeWdvdmRxbGxxbmRpeHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjQ2NjEsImV4cCI6MjA2NjI0MDY2MX0.udtcc1CR7nHYZGny4CHJWZPYEYzZRUA0UF04zbHYJT0'
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey)

// Navigation and UI Management
document.addEventListener('DOMContentLoaded', function() {
    // Theme Toggler
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const themeIcon = themeToggle.querySelector('i');

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            body.classList.remove('dark-mode');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    };

    themeToggle.addEventListener('click', () => {
        const isDarkMode = body.classList.contains('dark-mode');
        if (isDarkMode) {
            localStorage.setItem('theme', 'light');
            applyTheme('light');
        } else {
            localStorage.setItem('theme', 'dark');
            applyTheme('dark');
        }
    });

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // Check user authentication
    function checkAuth() {
        const userData = localStorage.getItem('user');
        if (!userData) {
            // User not logged in, redirect to login page
            window.location.href = 'login.html';
            return;
        }
        
        try {
            const user = JSON.parse(userData);
            // Display user name in header
            const userNameElement = document.getElementById('userName');
            if (userNameElement && user.nama) {
                userNameElement.textContent = user.nama;
            }
            
            // Display user ID in dropdown
            const userIDElement = document.getElementById('userID');
            if (userIDElement && user.userid) {
                userIDElement.textContent = user.userid;
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        }
    }

    // Logout functionality
    function logout() {
        if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        }
    }

    // Initialize authentication check
    checkAuth();

    // Add logout event listener
    function setLogoutBtnListener() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.onclick = function(e) {
                e.preventDefault();
                logout();
            };
        }
    }

    // Function untuk memuat data akun pengguna
    function loadAccountSection() {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                document.getElementById('accountName').textContent = user.nama || '-';
                document.getElementById('accountUserID').textContent = user.userid || '-';
            } catch (error) {
                document.getElementById('accountName').textContent = '-';
                document.getElementById('accountUserID').textContent = '-';
            }
        }
        setLogoutBtnListener();
    }

    // Navigation handling with Bootstrap
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

        // Update active nav link
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-target') === targetId) {
                link.classList.add('active');
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
            // Load jurusan jika membuka section jurusan
            if (targetId === 'jurusan-section') {
                loadJurusan();
            }
            // Load prodi jika membuka section prodi
            if (targetId === 'prodi-section') {
                loadProdi();
                loadJurusanDropdown();
            }
            // Load profile data jika membuka section profile
            if (targetId === 'profile') {
                loadProfileData();
            }
            // Load account data jika membuka section account
            if (targetId === 'account') {
                loadAccountSection();
            }

            // Close mobile menu after navigation
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                bsCollapse.hide();
            }
        });
    });

    // Panggil setLogoutBtnListener saat halaman siap (untuk default section)
    setLogoutBtnListener();

    // Statistics update function
    async function updateStatistics() {
        try {
            const { data, error } = await supabaseClient.from('mahasiswa').select('*');

            if (error) throw error;

            const totalStudents = data ? data.length : 0;
            const uniqueProdi = data ? new Set(data.map(m => m.id_prodi)).size : 0;

            document.getElementById('totalStudents').textContent = totalStudents;
            document.getElementById('totalJurusan').textContent = uniqueProdi;
        } catch (error) {
            console.error('Error updating statistics:', error);
        }
    }

    // Fungsi untuk memuat data mahasiswa
    async function loadStudents() {
        const tbody = document.querySelector('#studentTable tbody');
        
        try {
            // Show loading state
            tbody.innerHTML = '<tr><td colspan="5" class="text-center"><div class="loading"></div> Memuat data...</td></tr>';

            const { data, error } = await supabaseClient.from('mahasiswa').select('*');

            if (error) {
                console.error('Error fetching data:', error);
                throw error;
            }

            // Clear table
            tbody.innerHTML = '';

            if (!data || data.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center">
                            <div class="empty-state">
                                <i class="fas fa-users"></i>
                                <p>Tidak ada data mahasiswa</p>
                                <small class="text-muted">Mulai dengan menambahkan data mahasiswa baru</small>
                            </div>
                        </td>
                    </tr>
                `;
                updateStatistics();
                return;
            }

            // Populate table
            data.forEach(m => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${m.nim}</td>
                    <td>${m.nama}</td>
                    <td>${m.tgl_lahir || '-'}</td>
                    <td>${m.alamat || '-'}</td>
                    <td>${m.agama || '-'}</td>
                    <td>${m.kelamin || '-'}</td>
                    <td>${m.no_hp || '-'}</td>
                    <td>${m.email || '-'}</td>
                    <td>${m.id_prodi || '-'}</td>
                    <td>
                        <div class="action-buttons">
                            <button onclick="editStudent('${m.nim}')" class="btn btn-edit btn-sm">Edit</button>
                            <button onclick="deleteStudent('${m.nim}')" class="btn btn-delete btn-sm">Hapus</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });

            // Update statistics
            updateStatistics();

        } catch (error) {
            console.error('Error:', error);
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Gagal memuat data
                    </td>
                </tr>
            `;
        }
    }

    // Fungsi untuk mengambil data prodi dari Supabase dan mengisi dropdown
    async function loadProdiDropdown() {
        const prodiSelect = document.getElementById('id_prodi');
        prodiSelect.innerHTML = '<option value="">Pilih Program Studi</option>';
        try {
            const { data, error } = await supabaseClient.from('prodi').select('id_prodi, nama_prodi, id_jurusan');
            if (error) throw error;
            data.forEach(prodi => {
                const option = document.createElement('option');
                option.value = prodi.id_prodi;
                option.textContent = prodi.nama_prodi + ' (ID Jurusan: ' + prodi.id_jurusan + ')';
                prodiSelect.appendChild(option);
            });
        } catch (error) {
            prodiSelect.innerHTML = '<option value="">Gagal memuat prodi</option>';
        }
    }

    // Panggil loadProdiDropdown saat halaman siap
    loadProdiDropdown();

    // Function untuk memuat data profil pengguna
    function loadProfileData() {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                document.getElementById('edit_userid').value = user.userid || '';
                document.getElementById('edit_nama').value = user.nama || '';
            } catch (error) {
                console.error('Error parsing user data for profile:', error);
            }
        }
    }

    // Form handling
    const studentForm = document.getElementById('studentForm');
    
    studentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<div class="loading me-2"></div>Menyimpan...';
        submitBtn.disabled = true;

        const editId = document.getElementById('editId').value;
        
        const studentData = {
            nim: document.getElementById('nim').value,
            nama: document.getElementById('nama').value,
            tgl_lahir: document.getElementById('tgl_lahir').value,
            alamat: document.getElementById('alamat').value,
            agama: document.getElementById('agama').value,
            kelamin: document.getElementById('kelamin').value,
            no_hp: document.getElementById('no_hp').value,
            email: document.getElementById('email').value,
            id_prodi: parseInt(document.getElementById('id_prodi').value)
        };

        try {
            let response;
            
            if (editId) {
                // Update existing data
                response = await supabaseClient.from('mahasiswa').update(studentData).eq('nim', editId);
            } else {
                // Insert new data
                response = await supabaseClient.from('mahasiswa').insert([studentData]);
            }

            if (response.error) throw response.error;

            // Reset form
            studentForm.reset();
            document.getElementById('editId').value = '';
            submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Simpan';
            submitBtn.disabled = false;
            
            // Reload data
            await loadStudents();
            
            // Show success message
            showAlert(editId ? 'Data berhasil diupdate!' : 'Data berhasil ditambahkan!', 'success');
            
        } catch (error) {
            console.error('Error:', error);
            showAlert('Gagal menyimpan data: ' + error.message, 'danger');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Alert function
    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    // Edit function
    window.editStudent = async function(nim) {
        try {
            const { data, error } = await supabaseClient.from('mahasiswa').select('*').eq('nim', nim).single();

            if (error) throw error;

            if (data) {
                // Fill form with data
                document.getElementById('editId').value = data.nim;
                document.getElementById('nim').value = data.nim;
                document.getElementById('nama').value = data.nama;
                
                // Change button text
                const submitBtn = document.getElementById('submitBtn');
                submitBtn.innerHTML = '<i class="fas fa-edit me-2"></i>Update';
                
                showAlert('Data siap untuk diedit', 'info');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Gagal memuat data untuk edit: ' + error.message, 'danger');
        }
    };

    // Delete function
    window.deleteStudent = async function(nim) {
        if (confirm('Yakin ingin menghapus data ini?')) {
            try {
                const { error } = await supabaseClient.from('mahasiswa').delete().eq('nim', nim);

                if (error) throw error;

                await loadStudents();
                showAlert('Data berhasil dihapus!', 'success');
            } catch (error) {
                console.error('Error:', error);
                showAlert('Gagal menghapus data: ' + error.message, 'danger');
            }
        }
    };

    // Initial load if on data section
    if (document.getElementById('mid-section').classList.contains('active')) {
        loadStudents();
    }

    // Initialize statistics
    updateStatistics();

    // Form reset when switching to data section
    document.querySelector('a[data-target="mid-section"]').addEventListener('click', function() {
        const form = document.getElementById('studentForm');
        const submitBtn = document.getElementById('submitBtn');
        
        // Reset form if not in edit mode
        if (!document.getElementById('editId').value) {
            form.reset();
            submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Simpan';
        }
    });

    // Search functionality (optional enhancement)
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'form-control mb-3';
    searchInput.placeholder = 'Cari mahasiswa...';
    searchInput.id = 'searchInput';
    
    const tableContainer = document.querySelector('#mid-section .card-body');
    if (tableContainer) {
        tableContainer.insertBefore(searchInput, tableContainer.firstChild);
        
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#studentTable tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
        });
    });
    }

    document.getElementById('editProfileForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const updateProfileBtn = document.getElementById('updateProfileBtn');
        const originalText = updateProfileBtn.innerHTML;
        
        // Show loading state
        updateProfileBtn.innerHTML = '<div class="loading me-2"></div>Menyimpan...';
        updateProfileBtn.disabled = true;
        
        const userid = document.getElementById('edit_userid').value;
        const nama = document.getElementById('edit_nama').value;
        const oldPassword = document.getElementById('old_password').value;
        const newPassword = document.getElementById('new_password').value;

        try {
            // Ambil data user lama
            const { data: user, error } = await supabaseClient.from('users').select('*').eq('userid', userid).single();

            if (error || !user) {
                showAlert('User tidak ditemukan!', 'danger');
                updateProfileBtn.innerHTML = originalText;
                updateProfileBtn.disabled = false;
                return;
            }

            // Verifikasi password lama
            if (oldPassword !== user.passw) { // Sementara gunakan plain text match
                showAlert('Password lama salah!', 'danger');
                updateProfileBtn.innerHTML = originalText;
                updateProfileBtn.disabled = false;
                return;
            }

            // Siapkan data update
            let updateData = { nama };
            if (newPassword) {
                updateData.passw = newPassword; // Sementara simpan plain text
            }

            // Update user
            const { error: updateError } = await supabaseClient.from('users').update(updateData).eq('userid', userid);

            if (updateError) {
                showAlert('Gagal update profil: ' + updateError.message, 'danger');
                updateProfileBtn.innerHTML = originalText;
                updateProfileBtn.disabled = false;
            } else {
                // Update localStorage with new user data
                localStorage.setItem('user', JSON.stringify({ userid: userid, nama: nama }));
                
                // Update displayed user name
                const userNameElement = document.getElementById('userName');
                if (userNameElement) {
                    userNameElement.textContent = nama;
                }
                
                // Update displayed user ID
                const userIDElement = document.getElementById('userID');
                if (userIDElement) {
                    userIDElement.textContent = userid;
                }
                
                showAlert('Profil berhasil diupdate!', 'success');
                document.getElementById('editProfileForm').reset();
                loadProfileData(); // Reload the form with updated data
                updateProfileBtn.innerHTML = originalText;
                updateProfileBtn.disabled = false;
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showAlert('Gagal update profil: ' + error.message, 'danger');
            updateProfileBtn.innerHTML = originalText;
            updateProfileBtn.disabled = false;
        }
    });

    document.getElementById('studentForm').scrollIntoView({ behavior: 'smooth' });

    // ===================== JURUSAN =====================
    async function loadJurusan() {
        const tbody = document.querySelector('#jurusanTable tbody');
        try {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center"><div class="loading"></div> Memuat data...</td></tr>';
            const { data, error } = await supabaseClient.from('jurusan').select('*');
            if (error) throw error;
            tbody.innerHTML = '';
            if (!data || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" class="text-center"><div class="empty-state"><i class="fas fa-building-columns"></i><p>Tidak ada data jurusan</p></div></td></tr>`;
                return;
            }
            data.forEach(j => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${j.id_jurusan}</td>
                    <td>${j.nama_jurusan}</td>
                    <td>
                        <div class="action-buttons">
                            <button onclick="editJurusan('${j.id_jurusan}')" class="btn btn-edit btn-sm">Edit</button>
                            <button onclick="deleteJurusan('${j.id_jurusan}')" class="btn btn-delete btn-sm">Hapus</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center text-danger"><i class="fas fa-exclamation-triangle me-2"></i>Gagal memuat data</td></tr>`;
        }
    }

    const jurusanForm = document.getElementById('jurusanForm');
    if (jurusanForm) {
        jurusanForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitBtn = document.getElementById('submitJurusanBtn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<div class="loading me-2"></div>Menyimpan...';
            submitBtn.disabled = true;
            const editId = document.getElementById('editJurusanId').value;
            const nama_jurusan = document.getElementById('nama_jurusan').value;
            try {
                let response;
                if (editId) {
                    response = await supabaseClient.from('jurusan').update({ nama_jurusan }).eq('id_jurusan', editId);
                } else {
                    response = await supabaseClient.from('jurusan').insert([{ nama_jurusan }]);
                }
                if (response.error) throw response.error;
                jurusanForm.reset();
                document.getElementById('editJurusanId').value = '';
                submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Simpan';
                submitBtn.disabled = false;
                await loadJurusan();
                showAlert(editId ? 'Data jurusan berhasil diupdate!' : 'Data jurusan berhasil ditambahkan!', 'success');
            } catch (error) {
                showAlert('Gagal menyimpan data jurusan: ' + error.message, 'danger');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    window.editJurusan = async function(id_jurusan) {
        try {
            const { data, error } = await supabaseClient.from('jurusan').select('*').eq('id_jurusan', id_jurusan).single();
            if (error) throw error;
            if (data) {
                document.getElementById('editJurusanId').value = data.id_jurusan;
                document.getElementById('nama_jurusan').value = data.nama_jurusan;
                const submitBtn = document.getElementById('submitJurusanBtn');
                submitBtn.innerHTML = '<i class="fas fa-edit me-2"></i>Update';
                showAlert('Data jurusan siap untuk diedit', 'info');
            }
        } catch (error) {
            showAlert('Gagal memuat data jurusan untuk edit: ' + error.message, 'danger');
        }
    };

    window.deleteJurusan = async function(id_jurusan) {
        if (confirm('Yakin ingin menghapus data jurusan ini?')) {
            try {
                const { error } = await supabaseClient.from('jurusan').delete().eq('id_jurusan', id_jurusan);
                if (error) throw error;
                await loadJurusan();
                showAlert('Data jurusan berhasil dihapus!', 'success');
            } catch (error) {
                showAlert('Gagal menghapus data jurusan: ' + error.message, 'danger');
            }
        }
    };

    // ===================== PRODI =====================
    async function loadProdi() {
        const tbody = document.querySelector('#prodiTable tbody');
        try {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center"><div class="loading"></div> Memuat data...</td></tr>';
            const { data, error } = await supabaseClient.from('prodi').select('id_prodi, nama_prodi, id_jurusan');
            if (error) throw error;
            tbody.innerHTML = '';
            if (!data || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="text-center"><div class="empty-state"><i class="fas fa-book-open"></i><p>Tidak ada data prodi</p></div></td></tr>`;
                return;
            }
            // Ambil data jurusan untuk mapping nama
            const { data: jurusanList } = await supabaseClient.from('jurusan').select('id_jurusan, nama_jurusan');
            data.forEach(p => {
                const jurusan = jurusanList ? jurusanList.find(j => j.id_jurusan === p.id_jurusan) : null;
                const namaJurusan = jurusan ? jurusan.nama_jurusan : '-';
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${p.id_prodi}</td>
                    <td>${p.nama_prodi}</td>
                    <td>${namaJurusan}</td>
                    <td>
                        <div class="action-buttons">
                            <button onclick="editProdi('${p.id_prodi}')" class="btn btn-edit btn-sm">Edit</button>
                            <button onclick="deleteProdi('${p.id_prodi}')" class="btn btn-delete btn-sm">Hapus</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger"><i class="fas fa-exclamation-triangle me-2"></i>Gagal memuat data</td></tr>`;
        }
    }

    const prodiForm = document.getElementById('prodiForm');
    if (prodiForm) {
        prodiForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitBtn = document.getElementById('submitProdiBtn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<div class="loading me-2"></div>Menyimpan...';
            submitBtn.disabled = true;
            const editId = document.getElementById('editProdiId').value;
            const nama_prodi = document.getElementById('nama_prodi').value;
            const id_jurusan = document.getElementById('id_jurusan_prodi').value;
            try {
                let response;
                if (editId) {
                    response = await supabaseClient.from('prodi').update({ nama_prodi, id_jurusan }).eq('id_prodi', editId);
                } else {
                    response = await supabaseClient.from('prodi').insert([{ nama_prodi, id_jurusan }]);
                }
                if (response.error) throw response.error;
                prodiForm.reset();
                document.getElementById('editProdiId').value = '';
                submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Simpan';
                submitBtn.disabled = false;
                await loadProdi();
                showAlert(editId ? 'Data prodi berhasil diupdate!' : 'Data prodi berhasil ditambahkan!', 'success');
            } catch (error) {
                showAlert('Gagal menyimpan data prodi: ' + error.message, 'danger');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    window.editProdi = async function(id_prodi) {
        try {
            const { data, error } = await supabaseClient.from('prodi').select('*').eq('id_prodi', id_prodi).single();
            if (error) throw error;
            if (data) {
                document.getElementById('editProdiId').value = data.id_prodi;
                document.getElementById('nama_prodi').value = data.nama_prodi;
                document.getElementById('id_jurusan_prodi').value = data.id_jurusan;
                const submitBtn = document.getElementById('submitProdiBtn');
                submitBtn.innerHTML = '<i class="fas fa-edit me-2"></i>Update';
                showAlert('Data prodi siap untuk diedit', 'info');
            }
        } catch (error) {
            showAlert('Gagal memuat data prodi untuk edit: ' + error.message, 'danger');
        }
    };

    window.deleteProdi = async function(id_prodi) {
        if (confirm('Yakin ingin menghapus data prodi ini?')) {
            try {
                const { error } = await supabaseClient.from('prodi').delete().eq('id_prodi', id_prodi);
                if (error) throw error;
                await loadProdi();
                showAlert('Data prodi berhasil dihapus!', 'success');
            } catch (error) {
                showAlert('Gagal menghapus data prodi: ' + error.message, 'danger');
            }
        }
    };

    // Dropdown jurusan untuk form prodi
    async function loadJurusanDropdown() {
        const jurusanSelect = document.getElementById('id_jurusan_prodi');
        jurusanSelect.innerHTML = '<option value="">Pilih Jurusan</option>';
        try {
            const { data, error } = await supabaseClient.from('jurusan').select('id_jurusan, nama_jurusan');
            if (error) throw error;
            data.forEach(jurusan => {
                const option = document.createElement('option');
                option.value = jurusan.id_jurusan;
                option.textContent = jurusan.nama_jurusan;
                jurusanSelect.appendChild(option);
            });
        } catch (error) {
            jurusanSelect.innerHTML = '<option value="">Gagal memuat jurusan</option>';
        }
    }
});
