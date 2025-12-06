import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { socialLinks } from '../config/content';

export const SECTION_INDEX = {
    INTRODUCTION: 0,
    RECENT_POSTS: 1,
    BACKGROUND: 2,
    WORKS: 3
};

export const SIDEBAR_LINKS = ['/', '/background', '/works', '/blog'];
const STANDALONE_SECTION_MAP = {
    '/background': SECTION_INDEX.BACKGROUND,
    '/works': SECTION_INDEX.WORKS,
    '/blog': SECTION_INDEX.RECENT_POSTS,
    '/search': SECTION_INDEX.RECENT_POSTS
};

const FocusContext = createContext(null);

const getWorksColumnCount = (pathname = '/') => {
    if (typeof window === 'undefined') {
        return pathname === '/works' ? 3 : 2;
    }
    if (pathname === '/works') {
        if (window.innerWidth >= 1024) {
            return 3;
        }
        if (window.innerWidth > 768) {
            return 2;
        }
        return 1;
    }
    return window.innerWidth <= 768 ? 1 : 2;
};

export function FocusProvider({ children }) {
    const location = useLocation();
    const [region, setRegion] = useState('sidebar'); // sidebar | top
    const [sidebarIndex, setSidebarIndex] = useState(0);
    const [sectionIndex, setSectionIndex] = useState(SECTION_INDEX.INTRODUCTION);
    const [mode, setMode] = useState('section'); // section | items
    const [itemIndex, setItemIndex] = useState(0);

    const [recentItemCount, setRecentItemCount] = useState(0);
    const [backgroundItemCount, setBackgroundItemCount] = useState(0);
    const [worksItemCount, setWorksItemCount] = useState(0);
    const introductionItemCount = socialLinks.length;

    const [worksColumns, setWorksColumns] = useState(() => getWorksColumnCount(location.pathname));
    const [navigationLocked, setNavigationLocked] = useState(false);
    const getMobileDisabled = useCallback(() => {
        if (typeof window === 'undefined') return false;
        const isSmall = window.innerWidth <= 768;
        const hasTouch = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;
        return isSmall || hasTouch;
    }, []);
    const [keyboardDisabled, setKeyboardDisabled] = useState(getMobileDisabled);

    const standaloneSectionIndex = STANDALONE_SECTION_MAP[location.pathname];
    const isStandalonePage = typeof standaloneSectionIndex !== 'undefined';
    const isHomePage = location.pathname === '/';

    useEffect(() => {
        const handleResize = () => {
            setWorksColumns(getWorksColumnCount(location.pathname));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [location.pathname]);

    useEffect(() => {
        setWorksColumns(getWorksColumnCount(location.pathname));
    }, [location.pathname]);

    const sectionMeta = useMemo(() => ({
        [SECTION_INDEX.INTRODUCTION]: {
            supportsItems: introductionItemCount > 0,
            itemCount: introductionItemCount,
            type: 'intro'
        },
        [SECTION_INDEX.RECENT_POSTS]: {
            supportsItems: recentItemCount > 0,
            itemCount: recentItemCount,
            type: 'recent'
        },
        [SECTION_INDEX.BACKGROUND]: {
            supportsItems: backgroundItemCount > 0,
            itemCount: backgroundItemCount,
            type: 'background'
        },
        [SECTION_INDEX.WORKS]: {
            supportsItems: worksItemCount > 0,
            itemCount: worksItemCount,
            type: 'works'
        }
    }), [recentItemCount, backgroundItemCount, worksItemCount, introductionItemCount]);

    const focusSidebar = useCallback((index = 0) => {
        setRegion('sidebar');
        setSidebarIndex(index);
        setMode('section');
        setSectionIndex(SECTION_INDEX.INTRODUCTION);
        setItemIndex(0);
    }, []);

    const focusStandaloneSection = useCallback((section) => {
        if (typeof section === 'undefined') return;
        setRegion('top');
        setSectionIndex(section);
        setMode('items');
        setItemIndex(0);
    }, []);

    const activateTopFromSidebar = useCallback(() => {
        setRegion('top');
        setMode('section');
        setSectionIndex(SECTION_INDEX.INTRODUCTION);
        setItemIndex(0);
    }, []);

    const activateTopPage = useCallback(() => {
        setRegion('top');
    }, []);

    useEffect(() => {
        const currentPathIndex = SIDEBAR_LINKS.indexOf(location.pathname);
        if (currentPathIndex >= 0) {
            setSidebarIndex(currentPathIndex);
        }
        if (isHomePage) {
            focusSidebar(0);
            return;
        }
        if (isStandalonePage) {
            focusStandaloneSection(standaloneSectionIndex);
            return;
        }
        focusSidebar(0);
    }, [focusSidebar, focusStandaloneSection, isHomePage, isStandalonePage, location.pathname, standaloneSectionIndex]);

    const getActiveFocusId = useCallback(() => {
        if (keyboardDisabled) return null;
        if (region === 'sidebar') {
            return `sidebar-${sidebarIndex}`;
        }
        if (mode === 'section') {
            return `top-section-${sectionIndex}`;
        }
        if (sectionIndex === SECTION_INDEX.INTRODUCTION) {
            return `top-item-intro-${itemIndex}`;
        }
        if (sectionIndex === SECTION_INDEX.RECENT_POSTS) {
            return `top-item-recent-${itemIndex}`;
        }
        if (sectionIndex === SECTION_INDEX.BACKGROUND) {
            return `top-item-background-${itemIndex}`;
        }
        if (sectionIndex === SECTION_INDEX.WORKS) {
            return `top-item-works-${itemIndex}`;
        }
        return null;
    }, [keyboardDisabled, region, sidebarIndex, mode, sectionIndex, itemIndex]);

    const activeFocusId = getActiveFocusId();

    useEffect(() => {
        if (!activeFocusId) return;
        const el = document.querySelector(`[data-focus-id="${activeFocusId}"]`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
    }, [activeFocusId]);

    const activateFocusedElement = useCallback(() => {
        const id = getActiveFocusId();
        if (!id) return;
        const element = document.querySelector(`[data-focus-id="${id}"]`);
        if (!element) return;

        const explicit = element.querySelector('[data-focus-activate="self"]');
        const target = element.dataset.focusActivate === 'self'
            ? element
            : explicit || element.querySelector('a,button,[role="link"],[data-focus-activate="self"]') || element;

        if (target) {
            target.click();
        }
    }, [getActiveFocusId]);

    const moveSidebarFocus = useCallback((direction) => {
        setSidebarIndex((prev) => {
            const max = SIDEBAR_LINKS.length - 1;
            if (direction === 'next') {
                return Math.min(prev + 1, max);
            }
            return Math.max(prev - 1, 0);
        });
    }, []);

    const handleSidebarKeys = useCallback((event) => {
        if (keyboardDisabled || navigationLocked || region !== 'sidebar') return false;
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(event.key)) {
            return false;
        }
        event.preventDefault();
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
            moveSidebarFocus('next');
            return true;
        }
        if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
            moveSidebarFocus('prev');
            return true;
        }
        if (event.key === 'Enter') {
            const selector = `[data-focus-id="sidebar-${sidebarIndex}"]`;
            const element = document.querySelector(selector);
            const targetPath = SIDEBAR_LINKS[sidebarIndex];
            if (element) {
                element.click();
            }
            if (targetPath === '/' && location.pathname === '/') {
                activateTopFromSidebar();
            } else if (targetPath === location.pathname) {
                focusStandaloneSection(STANDALONE_SECTION_MAP[targetPath]);
            }
            return true;
        }
        return false;
    }, [activateTopFromSidebar, focusStandaloneSection, keyboardDisabled, location.pathname, moveSidebarFocus, navigationLocked, region, sidebarIndex]);

    const clampItemIndex = useCallback((count) => {
        setItemIndex((prev) => Math.min(prev, Math.max(count - 1, 0)));
    }, []);

    useEffect(() => {
        if (mode === 'items') {
            const meta = sectionMeta[sectionIndex];
            if (!meta?.supportsItems) {
                if (!isStandalonePage) {
                    setMode('section');
                }
                setItemIndex(0);
            } else {
                clampItemIndex(meta.itemCount);
            }
        }
    }, [clampItemIndex, isStandalonePage, mode, sectionIndex, sectionMeta]);

    const handleSectionMove = useCallback((direction) => {
        setSectionIndex((prev) => {
            if (direction === 'next') {
                return Math.min(prev + 1, Object.keys(SECTION_INDEX).length - 1);
            }
            return Math.max(prev - 1, 0);
        });
    }, []);

    const handleItemMove = useCallback((delta) => {
        const meta = sectionMeta[sectionIndex];
        if (!meta?.itemCount) return;
        const lastIndex = meta.itemCount - 1;
        setItemIndex((prev) => {
            const next = Math.min(Math.max(prev + delta, 0), lastIndex);
            return next;
        });
    }, [sectionIndex, sectionMeta]);

    const handleWorksMove = useCallback((deltaRow, deltaCol) => {
        const meta = sectionMeta[sectionIndex];
        if (!meta?.itemCount) return;
        const lastIndex = meta.itemCount - 1;
        setItemIndex((prev) => {
            let next = prev;
            if (deltaRow !== 0) {
                next = prev + deltaRow * worksColumns;
            }
            if (deltaCol !== 0) {
                next = prev + deltaCol;
            }
            return Math.min(Math.max(next, 0), lastIndex);
        });
    }, [sectionIndex, sectionMeta, worksColumns]);

    const handleTopKeys = useCallback((event) => {
        if (keyboardDisabled || navigationLocked || region !== 'top') return false;
        const key = event.key;
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'].includes(key)) {
            return false;
        }
        const meta = sectionMeta[sectionIndex];
        event.preventDefault();

        if (isStandalonePage) {
            if (!meta?.supportsItems) {
                if (key === 'Escape') {
                    focusSidebar();
                }
                return true;
            }

            if (key === 'Enter') {
                activateFocusedElement();
                return true;
            }

            if (key === 'Escape') {
                focusSidebar();
                return true;
            }

            if (meta.type === 'works') {
                if (key === 'ArrowDown') {
                    handleWorksMove(1, 0);
                    return true;
                }
                if (key === 'ArrowUp') {
                    handleWorksMove(-1, 0);
                    return true;
                }
                if (key === 'ArrowRight') {
                    handleWorksMove(0, 1);
                    return true;
                }
                if (key === 'ArrowLeft') {
                    handleWorksMove(0, -1);
                    return true;
                }
                return true;
            }

            if (key === 'ArrowDown' || key === 'ArrowRight') {
                handleItemMove(1);
                return true;
            }
            if (key === 'ArrowUp' || key === 'ArrowLeft') {
                handleItemMove(-1);
                return true;
            }
            return true;
        }

        if (mode === 'section') {
            if (key === 'ArrowDown' || key === 'ArrowRight') {
                handleSectionMove('next');
                return true;
            }
            if (key === 'ArrowUp' || key === 'ArrowLeft') {
                handleSectionMove('prev');
                return true;
            }
            if (key === 'Enter' && meta?.supportsItems) {
                setMode('items');
                setItemIndex(0);
                return true;
            }
            if (key === 'Escape') {
                focusSidebar();
                return true;
            }
            return true;
        }

        if (!meta?.supportsItems) {
            setMode('section');
            return true;
        }

        if (key === 'Enter') {
            activateFocusedElement();
            return true;
        }

        if (key === 'Escape') {
            if (sectionIndex === SECTION_INDEX.INTRODUCTION) {
                focusSidebar();
            } else {
                setMode('section');
            }
            return true;
        }

        if (meta.type === 'works') {
            if (key === 'ArrowDown') {
                handleWorksMove(1, 0);
                return true;
            }
            if (key === 'ArrowUp') {
                handleWorksMove(-1, 0);
                return true;
            }
            if (key === 'ArrowRight') {
                handleWorksMove(0, 1);
                return true;
            }
            if (key === 'ArrowLeft') {
                handleWorksMove(0, -1);
                return true;
            }
            return true;
        }

        if (key === 'ArrowDown' || key === 'ArrowRight') {
            handleItemMove(1);
            return true;
        }
        if (key === 'ArrowUp' || key === 'ArrowLeft') {
            handleItemMove(-1);
            return true;
        }

        return true;
    }, [activateFocusedElement, focusSidebar, handleItemMove, handleSectionMove, handleWorksMove, isStandalonePage, keyboardDisabled, mode, navigationLocked, region, sectionIndex, sectionMeta, worksColumns]);

    useEffect(() => {
        if (keyboardDisabled) return undefined;
        const handleKeyDown = (event) => {
            if (handleSidebarKeys(event)) return;
            handleTopKeys(event);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSidebarKeys, handleTopKeys, keyboardDisabled]);

    const lockNavigation = useCallback(() => setNavigationLocked(true), []);
    const unlockNavigation = useCallback(() => setNavigationLocked(false), []);

    const value = useMemo(() => ({
        focusState: {
            region,
            sidebarIndex,
            sectionIndex,
            mode,
            itemIndex
        },
        activeFocusId,
        setRecentItemCount,
        setBackgroundItemCount,
        setWorksItemCount,
        introductionItemCount,
        activateTopPage,
        lockNavigation,
        unlockNavigation
    }), [
        region,
        sidebarIndex,
        sectionIndex,
        mode,
        itemIndex,
        activeFocusId,
        introductionItemCount,
        activateTopPage,
        setRecentItemCount,
        setBackgroundItemCount,
        setWorksItemCount,
        lockNavigation,
        unlockNavigation
    ]);

    return (
        <FocusContext.Provider value={value}>
            {children}
        </FocusContext.Provider>
    );
}

export const useFocusContext = () => {
    const context = useContext(FocusContext);
    if (!context) {
        throw new Error('useFocusContext must be used within FocusProvider');
    }
    return context;
};

export const useIsFocused = (focusId) => {
    const { activeFocusId } = useFocusContext();
    return activeFocusId === focusId;
};
