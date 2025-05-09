document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (currentUser) {
        // Update navigation to show username with dropdown
        const navRight = document.querySelector('.nav-right');
        navRight.innerHTML = `
        <a href="exclusive.html" class="exclusive-link"></a>
            <div class="user-dropdown">
                <button class="user-dropdown-btn">${currentUser.username} <i class="fas fa-chevron-down"></i></button>
                <div class="user-dropdown-content">
                    ${currentUser.role === 'admin' ? 
                        '<a href="dashboard.html"><i class="fas fa-chart-line"></i> Dashboard</a>' 
                        : ''}
                    <a href="settings.html"><i class="fas fa-cog"></i> Settings</a>
                    <a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>
                </div>
            </div>
            <div class="logo">
                <a href="index.html" style="
    display: flex;
    align-items: center;
    text-decoration: none;
    line-height: 0;
">
    <img src="img/people/logo.png" alt="FG Logo" class="l_logo">
</a>
            </div>
        `;

        // Add hover functionality
        const dropdown = document.querySelector('.user-dropdown');
        dropdown.addEventListener('mouseover', function() {
            this.querySelector('.user-dropdown-content').style.display = 'block';
        });
        
        dropdown.addEventListener('mouseleave', function() {
            this.querySelector('.user-dropdown-content').style.display = 'none';
        });
    }
});

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}
