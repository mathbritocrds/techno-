// Dicionário de Títulos de Páginas
const pageTitles = {
  dashboard: 'Painel de Controle',
  collaborators: 'Colaboradores',
  attendance: 'Frequência & Ponto',
  roles: 'Cargos & Salários',
  payroll: 'Folha de Pagamento',
  integration: 'Integração API / Sync'
};

// Função para Navegação Dinâmica de Páginas
async function navigateTo(pageId) {
  const container = document.getElementById('content-container');
  
  try {
    const response = await fetch(`pages/${pageId}.html`);
    if (response.ok) {
      container.innerHTML = await response.text();
    } else {
      container.innerHTML = `<div class="p-4 text-xs text-red-400">Erro ao carregar a página: ${pageId}</div>`;
    }
  } catch (error) {
    console.error("Erro ao buscar a página:", error);
  }

  // Atualiza Breadcrumbs e Título
  document.getElementById('breadcrumb-page').textContent = pageTitles[pageId] || pageId;
  document.getElementById('page-heading').textContent = pageTitles[pageId] || pageId;

  // Atualiza Classe dos Botões de Navegação
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.className = "nav-btn flex items-center px-3 py-2.5 text-xs font-medium rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-all border border-transparent";
  });

  const activeBtn = document.getElementById(`nav-${pageId}`);
  if (activeBtn) {
    activeBtn.className = "nav-btn flex items-center px-3 py-2.5 text-xs font-medium rounded-lg transition-all text-brand-400 bg-emerald-500/10 border border-emerald-500/30";
  }
}

// Funções dos Modais
function openModal(modalId) {
  document.getElementById(modalId)?.classList.remove('hidden');
}

function closeModal(modalId) {
  document.getElementById(modalId)?.classList.add('hidden');
}

function showToast(message) {
  alert(message);
}

function handleEmployeeSubmit(event) {
  event.preventDefault();
  showToast('Colaborador cadastrado com sucesso!');
  closeModal('modal-add-employee');
}

function confirmPunchRecord() {
  showToast('Ponto registrado com sucesso!');
  closeModal('modal-punch');
}

// Inicialização Padrão
document.addEventListener('DOMContentLoaded', () => {
  navigateTo('dashboard');
});