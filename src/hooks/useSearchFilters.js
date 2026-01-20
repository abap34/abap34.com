import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const dedupeTags = (rawTags = []) => {
  const seen = new Set();
  const normalized = [];

  rawTags.forEach((tag) => {
    if (!tag) return;
    const trimmed = tag.trim();
    if (!trimmed) return;
    const token = trimmed.toLowerCase();

    if (seen.has(token)) return;
    seen.add(token);
    normalized.push(trimmed);
  });

  return normalized;
};

export function useSearchFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('q') || '';
  const tagsParam = searchParams.get('tags') || '';

  const tags = useMemo(() => {
    if (!tagsParam) return [];
    return dedupeTags(tagsParam.split(','));
  }, [tagsParam]);

  const updateParams = useCallback(
    (nextKeyword, nextTags) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmedKeyword = (nextKeyword || '').trim();
      const normalizedTags = dedupeTags(nextTags);

      if (trimmedKeyword) {
        params.set('q', trimmedKeyword);
      } else {
        params.delete('q');
      }

      if (normalizedTags.length > 0) {
        params.set('tags', normalizedTags.join(','));
      } else {
        params.delete('tags');
      }

      setSearchParams(params, { replace: false });
    },
    [searchParams, setSearchParams]
  );

  const setKeyword = useCallback(
    (value) => {
      updateParams(value, tags);
    },
    [tags, updateParams]
  );

  const setTags = useCallback(
    (nextTags) => {
      updateParams(keyword, nextTags);
    },
    [keyword, updateParams]
  );

  const addTag = useCallback(
    (tag) => {
      if (!tag) return;
      const trimmed = tag.trim();
      if (!trimmed) return;

      if (tags.some((existing) => existing.toLowerCase() === trimmed.toLowerCase())) {
        return;
      }

      setTags([...tags, trimmed]);
    },
    [tags, setTags]
  );

  const removeTag = useCallback(
    (tag) => {
      const trimmed = tag.trim().toLowerCase();
      if (!trimmed) return;

      if (!tags.some((existing) => existing.toLowerCase() === trimmed)) {
        return;
      }

      setTags(tags.filter((existing) => existing.toLowerCase() !== trimmed));
    },
    [tags, setTags]
  );

  const clearTags = useCallback(() => {
    if (tags.length === 0) return;
    setTags([]);
  }, [tags, setTags]);

  return {
    keyword,
    tags,
    setKeyword,
    setTags,
    addTag,
    removeTag,
    clearTags
  };
}
