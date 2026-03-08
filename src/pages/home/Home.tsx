import { useRef, useCallback, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import styles from "./Home.module.css";

import NavBar from "../../components/nav/NavBar";
import Top from "../../components/top/Top";
import ItemCard from "../../components/itemCard/ItemCard";
import SkeletonLoader from "../../components/skeletonLoader/SkeletonLoader";

import { LoaderCircle } from "lucide-react";

import { useAuth } from "../../Context/AuthProvider";

/* ---------------- Types ---------------- */

type Item = {
  id?: number;
  title: string;
  description: string;
  price: number;
  username: string;
  primary_image: string;
  images: string[];
  status: string;
};

/* ---------------- Constants ---------------- */

const LIMIT = 10;

/* ---------------- Component ---------------- */

const Home = () => {

  const [isReloading, setIsReloading] = useState(false);

  const { fetchAllItems } = useAuth();

  const observer = useRef<IntersectionObserver | null>(null);

  /* ---------------- React Query Fetch ---------------- */

  const fetchItems = async ({ pageParam = 0 }): Promise<Item[]> => {
    const data = await fetchAllItems(pageParam, LIMIT);
    return data;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["items"],
    queryFn: fetchItems,
    initialPageParam: 0,

    getNextPageParam: (lastPage, allPages) => {

      if (!lastPage || lastPage.length < LIMIT) {
        return undefined;
      }

      return allPages.length * LIMIT;
    },
  });

  const queryClient = useQueryClient();

  const refreshItems = () => {
    setIsReloading(true);

    setTimeout(() => {
      setIsReloading(false);
    }, Math.floor(Math.random() * 500 + 500));

    queryClient.invalidateQueries({ queryKey: ["items"] });
  };

  /* ---------------- Flatten Pages ---------------- */

  const items: Item[] =
  data?.pages
    .flat()
    .filter(item =>
      item &&
      item.title &&
      item.description &&
      item.primary_image
    ) ?? [];

  /* ---------------- Infinite Scroll ---------------- */

  const lastItemRef = useCallback((node: HTMLDivElement | null) => {

    if (isFetchingNextPage) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {

      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }

    });

    if (node) observer.current.observe(node);

  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  /* ---------------- UI ---------------- */

  return (
    <div className={styles.container}>

      <Top />

      <main>

        {items.map((item, index) => {

          const isLast = index === items.length - 1;

          if (isLast) {
            return (
              <div ref={lastItemRef} key={item.id ?? index}>
                <ItemCard
                  title={item.title}
                  description={item.description}
                  price={item.price}
                  seller={item.username}
                  timeLeft="2 days"
                  primary_image={item.primary_image}
                  images={item.images}
                  status={item.status}
                />
              </div>
            );
          }

          return (
            <ItemCard
              key={item.id ?? index}
              title={item.title}
              description={item.description}
              price={item.price}
              seller={item.username}
              timeLeft="2 days"
              primary_image={item.primary_image}
              images={item.images}
              status={item.status}
            />
          );
        })}

        {/* Loading Skeleton */}

        {isFetchingNextPage && <SkeletonLoader />}

        {/* No More Items */}

        {!hasNextPage && items.length > 0 && (
          <div className={styles.noItemsContainer}>
            <p>No more items</p>
          </div>
        )}

        {/* No Items */}

        {!isLoading && items.length === 0 && (
          <div className={styles.noItemsContainer}>
            <p>No items found</p>
            <button className={styles.refreshBtn} onClick={() => refreshItems()}>
              Reload
              {isReloading && <LoaderCircle/>}
            </button>
          </div>
        )}

      </main>

      <NavBar />

    </div>
  );
};

export default Home;