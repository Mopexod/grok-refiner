document.addEventListener('DOMContentLoaded', () => {
  const supportToggle = document.getElementById('supportToggle');
  const supportContent = document.getElementById('supportContent');
  
  if (supportToggle && supportContent) {
    supportToggle.addEventListener('click', () => {
      supportContent.classList.toggle('visible');
    });
  }
});
