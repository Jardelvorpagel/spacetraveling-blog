/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FiUser, FiCalendar } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const formatDate = (date: string) =>
    format(new Date(date), 'dd MMM yyyy', {
      locale: ptBR,
    });

  const handleLoadMorePosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(nextPage);
      const data = await response.json();
      setPosts(prev => [...prev, ...data.results]);
      setNextPage(data.next_page);
    } catch (err) {
      throw new Error(err);
    }
    setIsLoading(false);
  };

  return (
    <div className={commonStyles.container}>
      <div className={styles.logo}>
        <Image
          src="/images/logo.svg"
          alt="logo"
          width="238.62"
          height="25.63"
        />
      </div>
      <div className={styles.postList}>
        {posts.map(({ uid, data, first_publication_date }) => (
          <Link key={uid} href={`/post/${uid}`}>
            <a className={styles.postItem}>
              <p className={styles.postTitle}>{data.title}</p>
              <p className={styles.postSubtitle}>{data.subtitle}</p>
              <div className={commonStyles.postInfo}>
                <div className={commonStyles.postInfoItem}>
                  <FiCalendar />
                  <span>{formatDate(first_publication_date)}</span>
                </div>
                <div className={commonStyles.postInfoItem}>
                  <FiUser /> <span>{data.author}</span>
                </div>
              </div>
            </a>
          </Link>
        ))}
      </div>

      {nextPage && (
        <button
          type="button"
          className={styles.loadMore}
          onClick={handleLoadMorePosts}
        >
          {isLoading ? 'Carregando' : 'Carregar mais posts'}
        </button>
      )}
    </div>
  );
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 3,
    orderings: {
      field: 'document.first_publication_date',
      direction: 'desc',
    },
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: postsResponse.results,
      },
    },
  };
};
