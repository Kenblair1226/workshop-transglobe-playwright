'use strict';

/**
 * 保單查詢頁面的前端行為。
 * 僅與本機 /api/policies 端點溝通 — 不呼叫任何外部服務。
 */
(function () {
  const searchInput = document.getElementById('search-input');
  const productFilter = document.getElementById('product-filter');
  const statusFilter = document.getElementById('status-filter');
  const tableBody = document.getElementById('policy-table-body');
  const resultsCount = document.getElementById('results-count');
  const emptyState = document.getElementById('empty-state');
  const loadingIndicator = document.getElementById('search-loading');

  const modalOverlay = document.getElementById('policy-modal-overlay');
  const modalBody = document.getElementById('policy-modal-body');
  const modalClose = document.getElementById('policy-modal-close');

  const DEBOUNCE_MS = 300;
  let debounceTimer = null;
  let latestRequestId = 0;
  let latestPolicies = [];

  function statusBadgeClass(status) {
    return `badge badge--${status.toLowerCase()}`;
  }

  function formatCurrency(amount) {
    return `$${Number(amount).toFixed(2)}`;
  }

  function renderRows(policies) {
    latestPolicies = policies;
    tableBody.innerHTML = '';

    policies.forEach((policy) => {
      const row = document.createElement('tr');
      row.dataset.testid = 'policy-row';
      row.dataset.policyNumber = policy.policyNumber;

      row.innerHTML = `
        <td data-testid="policy-number">${policy.policyNumber}</td>
        <td data-testid="policy-holder">${policy.holderName}</td>
        <td data-testid="policy-product">${policy.product}</td>
        <td data-testid="policy-status"><span class="${statusBadgeClass(policy.status)}">${policy.status}</span></td>
        <td data-testid="policy-premium">${formatCurrency(policy.premium)}</td>
        <td><button type="button" class="btn btn-outline btn-small" data-testid="view-policy-btn" aria-label="View details for ${policy.holderName}">檢視</button></td>
      `;

      row.querySelector('[data-testid="view-policy-btn"]').addEventListener('click', () => {
        openPolicyModal(policy);
      });

      tableBody.appendChild(row);
    });

    const count = policies.length;
    resultsCount.textContent = `${count} ${count === 1 ? 'policy' : 'policies'} found`;
    emptyState.hidden = count !== 0;
  }

  function openPolicyModal(policy) {
    modalBody.innerHTML = `
      <div><dt>保單號碼</dt><dd data-testid="modal-policy-number">${policy.policyNumber}</dd></div>
      <div><dt>持有人</dt><dd data-testid="modal-holder">${policy.holderName}</dd></div>
      <div><dt>商品</dt><dd data-testid="modal-product">${policy.product}</dd></div>
      <div><dt>狀態</dt><dd data-testid="modal-status">${policy.status}</dd></div>
      <div><dt>每月保費</dt><dd data-testid="modal-premium">${formatCurrency(policy.premium)}</dd></div>
      <div><dt>保額</dt><dd data-testid="modal-coverage">${formatCurrency(policy.coverageAmount)}</dd></div>
      <div><dt>生效日期</dt><dd data-testid="modal-effective-date">${policy.effectiveDate}</dd></div>
      <div><dt>Email</dt><dd data-testid="modal-email">${policy.email}</dd></div>
    `;
    modalOverlay.classList.add('is-open');
  }

  function closePolicyModal() {
    modalOverlay.classList.remove('is-open');
  }

  modalClose.addEventListener('click', closePolicyModal);
  modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) closePolicyModal();
  });

  async function runSearch() {
    const requestId = ++latestRequestId;
    const params = new URLSearchParams({
      q: searchInput.value,
      product: productFilter.value,
      status: statusFilter.value,
    });

    loadingIndicator.classList.add('is-visible');
    try {
      const response = await fetch(`/api/policies?${params.toString()}`);
      const data = await response.json();
      // 忽略已被新請求取代、順序錯亂的回應。
      if (requestId !== latestRequestId) return;
      renderRows(data.results);
    } finally {
      if (requestId === latestRequestId) {
        loadingIndicator.classList.remove('is-visible');
      }
    }
  }

  function scheduleSearch() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runSearch, DEBOUNCE_MS);
  }

  searchInput.addEventListener('input', scheduleSearch);
  productFilter.addEventListener('change', runSearch);
  statusFilter.addEventListener('change', runSearch);

  // 初始載入。
  runSearch();

  // 供診斷／測試檢視目前狀態使用。
  window.__transglobe = window.__transglobe || {};
  window.__transglobe.getLatestPolicies = () => latestPolicies;
})();
