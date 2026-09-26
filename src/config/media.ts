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
    "/media/photo-1.jpg",
    "/media/photo-2.jpg", // пара на закате — заглушка-иллюстрация, заменить настоящим фото
    null, // "/media/photo-3.jpg"
    null, // "/media/photo-4.jpg"
    null, // "/media/photo-5.jpg"
    null, // "/media/photo-6.jpg"
  ] as (string | null)[],
  story: {
    audio: "/media/story-1.mp3",
    captions: "/media/story-1.vtt",
    /** Текст субтитров прямо в коде (используется одностраничной сборкой вместо файла). */
    captionsText: null as string | null,
  },
  /** Когда будет готова 3D-модель — впишите "/models/frame.glb". */
  frameModel: null as string | null,
};
