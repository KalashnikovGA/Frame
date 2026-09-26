/**
 * Все медиафайлы сайта. Положите файл в /public/media и впишите путь сюда.
 * Пока путь равен null — на его месте рисуется аккуратная тёплая заглушка.
 */
export const MEDIA = {
  /** Фото продукта для первого экрана без WebGL и для соцсетей. */
  heroPoster: "/media/hero-poster.jpg" as string | null,
  /** Рендеры рамки для статичных версий секций (без WebGL / reduced motion). */
  posters: {
    front: null as string | null, // "/media/frame-front.jpg"
    side: null as string | null, // "/media/frame-side.jpg"
    night: null as string | null, // "/media/frame-night.jpg"
  },
  /** Видео «Как это работает». Пока null — показывается анимация, нарисованная в коде. */
  howVideo: null as string | null, // "/media/how-it-works.mp4"
  /** Необязательное видео для первого экрана без WebGL. */
  heroLoop: null as string | null, // "/media/hero-loop.mp4"
  /** Семейные фото на экране рамки. Порядок важен: первое — главное. */
  photos: [
    "/media/web/grandparents.jpg",
    "/media/web/couple.jpg",
    "/media/web/mom.jpg",
    "/media/web/grandpa.jpg",
    "/media/web/beach.jpg",
    "/media/web/sofa.jpg",
  ] as (string | null)[],
  /** Фото для оформления страницы. Сейчас — заглушки с Pexels (см. public/media/web/CREDITS.md). */
  web: {
    hero: "/media/web/hero.jpg",
    grandparents: "/media/web/grandparents.jpg",
    mom: "/media/web/mom.jpg",
    couple: "/media/web/couple.jpg",
    grandpa: "/media/web/grandpa.jpg",
    motherDaughter: "/media/web/mother-daughter.jpg",
    sunset: "/media/web/sunset.jpg",
    hike: "/media/web/hike.jpg",
    sofa: "/media/web/sofa.jpg",
    beach: "/media/web/beach.jpg",
    baby: "/media/web/baby.jpg",
    window: "/media/web/window.jpg",
    listening: "/media/web/listening.jpg",
  },
  story: {
    audio: "/media/story-1.mp3",
    captions: "/media/story-1.vtt",
    /** Текст субтитров прямо в коде (используется одностраничной сборкой вместо файла). */
    captionsText: null as string | null,
  },
  /** Когда будет готова 3D-модель — впишите "/models/frame.glb". */
  frameModel: null as string | null,
};
