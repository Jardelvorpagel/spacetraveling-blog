import { GetStaticPaths, GetStaticProps } from 'next';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { PrismicRichText } from '@prismicio/react';
import * as prismicH from '@prismicio/helpers';
import { FiClock, FiUser, FiCalendar } from 'react-icons/fi';
import { useRouter } from 'next/router';

import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const formatDate = (date: string) =>
    format(new Date(date), 'dd MMM yyyy', {
      locale: ptBR,
    });

  const totalWords = post.data.content.reduce((prevValue, currValue) => {
    const transformText = prismicH.asText(currValue.body).split(/[,.\s]/);
    return prevValue + transformText.length;
  }, 0);

  const wordsReadedByMinute = 200;
  const averageReadingTime = Math.ceil(totalWords / wordsReadedByMinute);

  return (
    <>
      <Header />
      <img
        className={styles.banner}
        alt="Post banner"
        src={post.data.banner.url}
      />
      <div className={commonStyles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{post.data.title}</h1>
          <div className={commonStyles.postInfo}>
            <div className={commonStyles.postInfoItem}>
              <FiCalendar />
              <span>{formatDate(post.first_publication_date)}</span>
            </div>
            <div className={commonStyles.postInfoItem}>
              <FiUser /> <span>{post.data.author}</span>
            </div>
            <div className={commonStyles.postInfoItem}>
              <FiClock /> <span>{averageReadingTime} min</span>
            </div>
          </div>
        </div>
        {post.data.content.map(item => (
          <div key={item.heading} className={styles.blockContent}>
            <h2 className={styles.contentHeading}>{item.heading}</h2>
            <div className={styles.contentBody}>
              <PrismicRichText field={item.body} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.getByType('posts');

  const paths = posts.results.map(({ uid }) => ({ params: { slug: uid } }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async context => {
  const prismic = getPrismicClient();
  const { params } = context;
  const response = await prismic.getByUID('posts', params.slug);

  return {
    props: {
      post: response,
    },
  };
};
