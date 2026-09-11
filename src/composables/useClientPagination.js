import { computed, ref, unref, watch } from 'vue';

export function useClientPagination(items, initialPageSize = 20) {
  const page = ref(1);
  const pageSize = ref(initialPageSize);
  const total = computed(() => unref(items)?.length || 0);
  const totalPages = computed(() => Math.max(Math.ceil(total.value / pageSize.value), 1));
  const paginatedItems = computed(() => {
    const list = unref(items) || [];
    const start = (page.value - 1) * pageSize.value;
    return list.slice(start, start + pageSize.value);
  });
  const pagination = computed(() => ({
    page: page.value,
    pageSize: pageSize.value,
    total: total.value,
    totalPages: totalPages.value,
  }));

  const setPage = (nextPage) => {
    page.value = Math.min(Math.max(Number(nextPage) || 1, 1), totalPages.value);
  };
  const setPageSize = (nextPageSize) => {
    pageSize.value = Number(nextPageSize) || initialPageSize;
    page.value = 1;
  };

  watch(total, () => {
    if (page.value > totalPages.value) page.value = totalPages.value;
  });
  watch(items, () => { page.value = 1; }, { deep: false });

  return { paginatedItems, pagination, setPage, setPageSize };
}
