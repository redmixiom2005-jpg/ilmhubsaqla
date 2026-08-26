/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from '../types';

export interface Translations {
  appName: string;
  appSlogan: string;
  tagline: string;
  inputPlaceholder: string;
  pasteBtn: string;
  clearBtn: string;
  analyzeBtn: string;
  analyzing: string;
  supportedFormats: string;
  youtubeVideo: string;
  youtubeShorts: string;
  qualityTitle: string;
  formatTitle: string;
  audioOnly: string;
  downloadBtn: string;
  downloading: string;
  processing: string;
  mergingAudioVideo: string;
  queued: string;
  queuedNotice: string;
  completedTitle: string;
  completedDesc: string;
  saveFileBtn: string;
  saveToFolderBtn: string;
  anotherVideoBtn: string;
  cancelBtn: string;
  cancelling: string;
  speed: string;
  eta: string;
  size: string;
  duration: string;
  views: string;
  channel: string;
  publishedAt: string;
  historyTitle: string;
  emptyHistory: string;
  clearHistory: string;
  clearHistoryConfirmTitle: string;
  clearHistoryConfirmMsg: string;
  confirmBtn: string;
  closeBtn: string;
  redownloadBtn: string;
  serverStatus: string;
  serverHealthy: string;
  serverDegraded: string;
  serverOffline: string;
  storageTitle: string;
  storageDesc: string;
  serverStorage: string;
  browserDownload: string;
  iosTitle: string;
  iosDownloadHint: string;
  actualSize: string;
  legalNotice: string;
  errorTitle: string;
  errors: {
    INVALID_URL: string;
    UNSUPPORTED_URL: string;
    PLAYLIST_NOT_SUPPORTED: string;
    VIDEO_UNAVAILABLE: string;
    PRIVATE_VIDEO: string;
    FORMAT_UNAVAILABLE: string;
    DOWNLOAD_FAILED: string;
    FFMPEG_MISSING: string;
    YTDLP_MISSING: string;
    RATE_LIMITED: string;
    JOB_NOT_FOUND: string;
    DOWNLOAD_CANCELLED: string;
    INTERNAL_ERROR: string;
    NETWORK_ERROR: string;
    SERVER_OFFLINE: string;
    EMPTY_URL: string;
    BOT_DETECTION_ERROR: string;
  };
  themeLight: string;
  themeDark: string;
  langUz: string;
  langRu: string;
  langEn: string;
  langKrill: string;
  copyLink: string;
  copied: string;
  showDescription: string;
  hideDescription: string;
  bestQuality: string;
  highQuality: string;
  standardQuality: string;
}

export const translations: Record<Language, Translations> = {
  uz: {
    appName: 'IlmHub Saqla Bot',
    appSlogan: 'IlmHub — Ilmlilar yetishib chiqadigan maskan !',
    tagline: 'YouTube va Shorts videolarini eng yuqori sifatda, tez va xavfsiz yuklab oling',
    inputPlaceholder: 'YouTube video yoki Shorts havolasini kiriting (masalan: https://youtu.be/...)',
    pasteBtn: 'Joylashtirish',
    clearBtn: 'Tozalash',
    analyzeBtn: 'Videoni tekshirish',
    analyzing: 'Tekshirilmoqda...',
    supportedFormats: 'YouTube video va Shorts formatlari qo‘llab-quvvatlanadi',
    youtubeVideo: 'YouTube Video',
    youtubeShorts: 'YouTube Shorts',
    qualityTitle: 'Video sifati',
    formatTitle: 'Format',
    audioOnly: 'Faqat audio (MP3)',
    downloadBtn: 'Yuklab olishni boshlash',
    downloading: 'Yuklanmoqda...',
    processing: 'Fayl qayta ishlanmoqda...',
    mergingAudioVideo: 'Audio va video FFmpeg yordamida birlashtirilmoqda...',
    queued: 'Navbatda',
    queuedNotice: 'Yuklab olish navbatga qo‘shildi.',
    completedTitle: 'Tayyor!',
    completedDesc: 'Video muvaffaqiyatli tayyorlandi.',
    saveFileBtn: 'Faylni yuklab olish',
    saveToFolderBtn: 'Papka tanlab saqlash',
    anotherVideoBtn: 'Yana video yuklash',
    cancelBtn: 'Bekor qilish',
    cancelling: 'Bekor qilinmoqda...',
    speed: 'Tezlik',
    eta: 'Qolgan vaqt',
    size: 'Hajmi',
    duration: 'Davomiyligi',
    views: 'Ko‘rishlar',
    channel: 'Kanal',
    publishedAt: 'Yuklangan sana',
    historyTitle: 'Yuklashlar tarixi',
    emptyHistory: 'Hozircha yuklab olingan videolar yo‘q',
    clearHistory: 'Tarixni tozalash',
    clearHistoryConfirmTitle: 'Tarixni tozalashni xohlaysizmi?',
    clearHistoryConfirmMsg: 'Barcha saqlangan yuklashlar ro‘yxati tozalanadi.',
    confirmBtn: 'Ha, tozalash',
    closeBtn: 'Yopish',
    redownloadBtn: 'Qayta yuklash',
    serverStatus: 'Server holati',
    serverHealthy: 'Server faol',
    serverDegraded: 'Qisman faol',
    serverOffline: 'Server bilan aloqa yo‘q',
    storageTitle: 'Saqlash joyi',
    storageDesc: 'Fayllar to‘g‘ridan-to‘g‘ri brauzeringiz orqali qurilmangizning Yuklashlar (Downloads) papkasiga saqlanadi.',
    serverStorage: 'Server xotirasi',
    browserDownload: 'Brauzer yuklamasi',
    iosTitle: 'iPhone / iPad',
    iosDownloadHint: 'Yuklab olingan fayl Safari orqali ochiladi. Kerak bo‘lsa Share → Save to Files orqali saqlang.',
    actualSize: 'Haqiqiy hajm',
    legalNotice: 'Foydalanuvchi faqat yuklab olishga haqli bo‘lgan kontentdan foydalanishi kerak.',
    errorTitle: 'Xatolik yuz berdi',
    errors: {
      INVALID_URL: 'Yaroqsiz havola kiritildi. Iltimos, to‘g‘ri YouTube havolasini kiriting.',
      UNSUPPORTED_URL: 'Faqat YouTube va YouTube Shorts havolalari qo‘llab-quvvatlanadi.',
      PLAYLIST_NOT_SUPPORTED: 'Playlist havolalari qo‘llab-quvvatlanmaydi. Iltimos, bitta YouTube video yoki Shorts havolasini kiriting.',
      VIDEO_UNAVAILABLE: 'Video mavjud emas yoki o‘chirib tashlangan.',
      PRIVATE_VIDEO: 'Ushbu video shaxsiy (maxfiy) bo‘lgani uchun uni yuklab bo‘lmaydi.',
      FORMAT_UNAVAILABLE: 'Tanlangan sifat formati ushbu video uchun mavjud emas.',
      DOWNLOAD_FAILED: 'Videoni yuklab olish jarayonida xatolik yuz berdi. Iltimos, qaytadan urinib ko‘ring.',
      FFMPEG_MISSING: 'Serverda FFmpeg o‘rnatilmagan yoki sozlanmagan.',
      YTDLP_MISSING: 'Serverda yt-dlp yordamchi dasturi topilmadi.',
      RATE_LIMITED: 'Juda ko‘p so‘rov yuborildi. Iltimos, bir oz kutib qaytadan urinib ko‘ring.',
      JOB_NOT_FOUND: 'Yuklash vazifasi topilmadi yoki muddati tugagan.',
      DOWNLOAD_CANCELLED: 'Yuklash foydalanuvchi tomonidan bekor qilindi.',
      INTERNAL_ERROR: 'Server ichki xatoligi yuz berdi.',
      NETWORK_ERROR: 'Tarmoq xatosi. Server bilan bog‘lanib bo‘lmadi.',
      SERVER_OFFLINE: 'Yuklash serveri bilan aloqa o‘rnatilmadi. Iltimos, backend ishlab turganini tekshiring.',
      EMPTY_URL: 'Iltimos, YouTube video havolasini kiriting.',
      BOT_DETECTION_ERROR: 'YouTube bot himoyasi: Yuklash uchun serverga cookies.txt fayli yuklanishi lozim.'
    },
    themeLight: 'Yorug‘',
    themeDark: 'Qorong‘i',
    langUz: 'O‘zbek',
    langRu: 'Русский',
    langEn: 'English',
    langKrill: 'Ўзбекча',
    copyLink: 'Havolani nusxalash',
    copied: 'Nusxalandi!',
    showDescription: 'Tavsifni ko‘rsatish',
    hideDescription: 'Tavsifni yopish',
    bestQuality: 'Eng yuqori sifat',
    highQuality: 'Yuqori sifat',
    standardQuality: 'Standart sifat'
  },
  ru: {
    appName: 'IlmHub Saqla Bot',
    appSlogan: 'IlmHub — Ilmlilar yetishib chiqadigan maskan !',
    tagline: 'Скачивайте видео и Shorts с YouTube в высоком качестве, быстро и безопасно',
    inputPlaceholder: 'Введите ссылку на видео или Shorts YouTube (например: https://youtu.be/...)',
    pasteBtn: 'Вставить',
    clearBtn: 'Очистить',
    analyzeBtn: 'Проверить видео',
    analyzing: 'Анализ...',
    supportedFormats: 'Поддерживаются видео и Shorts с YouTube',
    youtubeVideo: 'Видео YouTube',
    youtubeShorts: 'YouTube Shorts',
    qualityTitle: 'Качество видео',
    formatTitle: 'Формат',
    audioOnly: 'Только аудио (MP3)',
    downloadBtn: 'Начать скачивание',
    downloading: 'Скачивание...',
    processing: 'Обработка файла...',
    mergingAudioVideo: 'Объединение видео и аудио через FFmpeg...',
    queued: 'В очереди',
    queuedNotice: 'Загрузка добавлена в очередь.',
    completedTitle: 'Готово!',
    completedDesc: 'Видео успешно подготовлено.',
    saveFileBtn: 'Скачать файл',
    saveToFolderBtn: 'Сохранить в папку',
    anotherVideoBtn: 'Скачать еще видео',
    cancelBtn: 'Отмена',
    cancelling: 'Отмена...',
    speed: 'Скорость',
    eta: 'Осталось',
    size: 'Размер',
    duration: 'Длительность',
    views: 'Просмотры',
    channel: 'Канал',
    publishedAt: 'Дата публикации',
    historyTitle: 'История загрузок',
    emptyHistory: 'История загрузок пуста',
    clearHistory: 'Очистить историю',
    clearHistoryConfirmTitle: 'Очистить историю?',
    clearHistoryConfirmMsg: 'Все записи о загрузках будут удалены из памяти браузера.',
    confirmBtn: 'Да, очистить',
    closeBtn: 'Закрыть',
    redownloadBtn: 'Скачать снова',
    serverStatus: 'Статус сервера',
    serverHealthy: 'Сервер активен',
    serverDegraded: 'Ограниченная работа',
    serverOffline: 'Сервер недоступен',
    storageTitle: 'Место сохранения',
    storageDesc: 'Файлы скачиваются напрямую через браузер в вашу стандартную папку Загрузки (Downloads).',
    serverStorage: 'Хранилище сервера',
    browserDownload: 'Загрузка браузера',
    iosTitle: 'iPhone / iPad',
    iosDownloadHint: 'Файл откроется через Safari. При необходимости используйте Share → Save to Files.',
    actualSize: 'Фактический размер',
    legalNotice: 'Пользователь должен скачивать только тот контент, на который у него есть право.',
    errorTitle: 'Произошла ошибка',
    errors: {
      INVALID_URL: 'Неверная ссылка. Пожалуйста, введите корректную ссылку на YouTube.',
      UNSUPPORTED_URL: 'Поддерживаются только ссылки на YouTube и YouTube Shorts.',
      PLAYLIST_NOT_SUPPORTED: 'Ссылки на плейлисты не поддерживаются. Пожалуйста, введите ссылку на одно видео YouTube или Shorts.',
      VIDEO_UNAVAILABLE: 'Видео недоступно или удалено.',
      PRIVATE_VIDEO: 'Это видео является приватным и не может быть загружено.',
      FORMAT_UNAVAILABLE: 'Выбранное качество недоступно для этого видео.',
      DOWNLOAD_FAILED: 'Ошибка при загрузке видео. Пожалуйста, попробуйте снова.',
      FFMPEG_MISSING: 'FFmpeg не установлен или не настроен на сервере.',
      YTDLP_MISSING: 'Утилита yt-dlp не найдена на сервере.',
      RATE_LIMITED: 'Слишком много запросов. Пожалуйста, подождите немного.',
      JOB_NOT_FOUND: 'Задача загрузки не найдена или истекла.',
      DOWNLOAD_CANCELLED: 'Загрузка отменена пользователем.',
      INTERNAL_ERROR: 'Внутренняя ошибка сервера.',
      NETWORK_ERROR: 'Ошибка сети. Не удалось связаться с сервером.',
      SERVER_OFFLINE: 'Сервер загрузки недоступен. Проверьте статус backend сервера.',
      EMPTY_URL: 'Пожалуйста, введите ссылку на видео YouTube.',
      BOT_DETECTION_ERROR: 'Защита YouTube от ботов: для скачивания на сервере требуется cookies.txt.'
    },
    themeLight: 'Светлая',
    themeDark: 'Тёмная',
    langUz: 'O‘zbek',
    langRu: 'Русский',
    langEn: 'English',
    langKrill: 'Ўзбекча',
    copyLink: 'Скопировать ссылку',
    copied: 'Скопировано!',
    showDescription: 'Показать описание',
    hideDescription: 'Скрыть описание',
    bestQuality: 'Лучшее качество',
    highQuality: 'Высокое качество',
    standardQuality: 'Стандартное качество'
  },
  en: {
    appName: 'IlmHub Saqla Bot',
    appSlogan: 'IlmHub — Ilmlilar yetishib chiqadigan maskan !',
    tagline: 'Download YouTube videos and Shorts in premium quality, fast and safely',
    inputPlaceholder: 'Enter YouTube video or Shorts URL (e.g. https://youtu.be/...)',
    pasteBtn: 'Paste',
    clearBtn: 'Clear',
    analyzeBtn: 'Analyze Video',
    analyzing: 'Analyzing...',
    supportedFormats: 'YouTube Video and Shorts formats supported',
    youtubeVideo: 'YouTube Video',
    youtubeShorts: 'YouTube Shorts',
    qualityTitle: 'Video Quality',
    formatTitle: 'Format',
    audioOnly: 'Audio Only (MP3)',
    downloadBtn: 'Start Download',
    downloading: 'Downloading...',
    processing: 'Processing file...',
    mergingAudioVideo: 'Merging audio and video with FFmpeg...',
    queued: 'Queued',
    queuedNotice: 'Download added to queue.',
    completedTitle: 'Ready!',
    completedDesc: 'Video has been successfully processed.',
    saveFileBtn: 'Download File',
    saveToFolderBtn: 'Save to Folder',
    anotherVideoBtn: 'Download Another Video',
    cancelBtn: 'Cancel',
    cancelling: 'Cancelling...',
    speed: 'Speed',
    eta: 'ETA',
    size: 'Size',
    duration: 'Duration',
    views: 'Views',
    channel: 'Channel',
    publishedAt: 'Published date',
    historyTitle: 'Download History',
    emptyHistory: 'No downloads in history yet',
    clearHistory: 'Clear History',
    clearHistoryConfirmTitle: 'Clear history?',
    clearHistoryConfirmMsg: 'All saved download records will be cleared from browser storage.',
    confirmBtn: 'Yes, Clear',
    closeBtn: 'Close',
    redownloadBtn: 'Redownload',
    serverStatus: 'Server Status',
    serverHealthy: 'Server Healthy',
    serverDegraded: 'Degraded Service',
    serverOffline: 'Server Offline',
    storageTitle: 'Storage Destination',
    storageDesc: 'Files are streamed directly through your browser into your default Downloads folder.',
    serverStorage: 'Server Storage',
    browserDownload: 'Browser Download',
    iosTitle: 'iPhone / iPad',
    iosDownloadHint: 'The file opens in Safari. Use Share → Save to Files when needed.',
    actualSize: 'Actual size',
    legalNotice: 'Users should only download content they have the right to download.',
    errorTitle: 'An error occurred',
    errors: {
      INVALID_URL: 'Invalid URL provided. Please enter a valid YouTube URL.',
      UNSUPPORTED_URL: 'Only YouTube videos and YouTube Shorts are supported.',
      PLAYLIST_NOT_SUPPORTED: 'Playlist URLs are not supported. Please enter a single YouTube video or Shorts URL.',
      VIDEO_UNAVAILABLE: 'Video is unavailable or has been deleted.',
      PRIVATE_VIDEO: 'This video is private and cannot be downloaded.',
      FORMAT_UNAVAILABLE: 'The selected format is unavailable for this video.',
      DOWNLOAD_FAILED: 'An error occurred during video download. Please try again.',
      FFMPEG_MISSING: 'FFmpeg is not installed or configured on the server.',
      YTDLP_MISSING: 'yt-dlp utility was not found on the server.',
      RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
      JOB_NOT_FOUND: 'Download job not found or expired.',
      DOWNLOAD_CANCELLED: 'Download was cancelled by user.',
      INTERNAL_ERROR: 'Internal server error occurred.',
      NETWORK_ERROR: 'Network error. Could not connect to the downloader backend.',
      SERVER_OFFLINE: 'Downloader backend is offline. Please verify the server is running.',
      EMPTY_URL: 'Please enter a YouTube video URL.',
      BOT_DETECTION_ERROR: 'YouTube bot protection triggered: cookies.txt is required on the server.'
    },
    themeLight: 'Light',
    themeDark: 'Dark',
    langUz: 'O‘zbek',
    langRu: 'Русский',
    langEn: 'English',
    langKrill: 'Ўзбекча',
    copyLink: 'Copy Link',
    copied: 'Copied!',
    showDescription: 'Show description',
    hideDescription: 'Hide description',
    bestQuality: 'Best Quality',
    highQuality: 'High Quality',
    standardQuality: 'Standard Quality'
  },
  krill: {
    appName: 'IlmHub Saqla Bot',
    appSlogan: 'IlmHub — Ilmlilar yetishib chiqadigan maskan !',
    tagline: 'YouTube ва Shorts видеоларини энг юқори сифатда, тез ва хавфсиз юклаб олинг',
    inputPlaceholder: 'YouTube видео ёки Shorts ҳаволасини киритинг (масалан: https://youtu.be/...)',
    pasteBtn: 'Жойлаштириш',
    clearBtn: 'Тозалаш',
    analyzeBtn: 'Видеони текшириш',
    analyzing: 'Текширилмоқда...',
    supportedFormats: 'YouTube видео ва Shorts форматлари қўллаб-қувватланади',
    youtubeVideo: 'YouTube Видео',
    youtubeShorts: 'YouTube Shorts',
    qualityTitle: 'Видео сифати',
    formatTitle: 'Формат',
    audioOnly: 'Фақат аудио (MP3)',
    downloadBtn: 'Юклаб олишни бошлаш',
    downloading: 'Юкланмоқда...',
    processing: 'Файл қайта ишланмоқда...',
    mergingAudioVideo: 'Аудио ва видео FFmpeg ёрдамида бирлаштирилмоқда...',
    queued: 'Навбатда',
    queuedNotice: 'Юклаб олиш навбатга қўшилди.',
    completedTitle: 'Тайёр!',
    completedDesc: 'Видео муваффақиятли тайёрланди.',
    saveFileBtn: 'Файлни юклаб олиш',
    saveToFolderBtn: 'Папка танлаб сақлаш',
    anotherVideoBtn: 'Яна видео юклаш',
    cancelBtn: 'Бекор қилиш',
    cancelling: 'Бекор қилинмоқда...',
    speed: 'Тезлик',
    eta: 'Қолган вақт',
    size: 'Ҳажми',
    duration: 'Давомийлиги',
    views: 'Кўришлар',
    channel: 'Канал',
    publishedAt: 'Юкланган сана',
    historyTitle: 'Юклашлар тарихи',
    emptyHistory: 'Ҳозирча юклаб олинган видеолар йўқ',
    clearHistory: 'Тарихни тозалаш',
    clearHistoryConfirmTitle: 'Тарихни тозалашни хоҳлайсизми?',
    clearHistoryConfirmMsg: 'Барча сақланган юклашлар рўйхати тозаланади.',
    confirmBtn: 'Ҳа, тозалаш',
    closeBtn: 'Ёпиш',
    redownloadBtn: 'Қайта юклаш',
    serverStatus: 'Сервер ҳолати',
    serverHealthy: 'Сервер фаол',
    serverDegraded: 'Қисман фаол',
    serverOffline: 'Сервер билан алоқа йўқ',
    storageTitle: 'Сақлаш жойи',
    storageDesc: 'Файллар тўғридан-тўғри браузерингиз орқали қурилмангизнинг Юклашлар (Downloads) папкасига сақланади.',
    serverStorage: 'Сервер хотираси',
    browserDownload: 'Браузер юкламаси',
    iosTitle: 'iPhone / iPad',
    iosDownloadHint: 'Юкланган файл Safari орқали очилади. Керак бўлса Share → Save to Files орқали сақланг.',
    actualSize: 'Ҳақиқий ҳажм',
    legalNotice: 'Фойдаланувчи фақат юклаб олишга ҳаққи бўлган контентдан фойдаланиши керак.',
    errorTitle: 'Хатолик юз берди',
    errors: {
      INVALID_URL: 'Яроқсиз ҳавола киритилди. Илтимос, тўғри YouTube ҳаволасини киритинг.',
      UNSUPPORTED_URL: 'Фақат YouTube ва YouTube Shorts ҳаволалари қўллаб-қувватланади.',
      PLAYLIST_NOT_SUPPORTED: 'Плейлист ҳаволалари қўллаб-қувватланмайди. Илтимос, битта YouTube видео ёки Shorts ҳаволасини киритинг.',
      VIDEO_UNAVAILABLE: 'Видео мавжуд эмас ёки ўчириб ташланган.',
      PRIVATE_VIDEO: 'Ушбу видео шахсий (махфий) бўлгани учун уни юклаб бўлмайди.',
      FORMAT_UNAVAILABLE: 'Танланган сифат формати ушбу видео учун мавжуд эмас.',
      DOWNLOAD_FAILED: 'Видеони юклаб олиш жараёнида хатолик юз берди. Илтимос, қайтадан уриниб кўринг.',
      FFMPEG_MISSING: 'Серверда FFmpeg ўрнатилмаган ёки созланмаган.',
      YTDLP_MISSING: 'Серверда yt-dlp ёрдамчи дастури топилмади.',
      RATE_LIMITED: 'Жуда кўп сўров юборилди. Илтимос, бир оз кутиб қайтадан уриниб кўринг.',
      JOB_NOT_FOUND: 'Юклаш вазифаси топилмади ёки муддати тугаган.',
      DOWNLOAD_CANCELLED: 'Юклаш фойдаланувчи томонидан бекор қилинди.',
      INTERNAL_ERROR: 'Сервер ички хатолиги юз берди.',
      NETWORK_ERROR: 'Тармоқ хатоси. Сервер билан боғланиб бўлмади.',
      SERVER_OFFLINE: 'Юклаш сервери билан алоқа ўрнатилмади. Илтимос, backend ишлаб турганини текширинг.',
      EMPTY_URL: 'Илтимос, YouTube видео ҳаволасини киритинг.',
      BOT_DETECTION_ERROR: 'YouTube бот ҳимояси: Юклаш учун серверга cookies.txt файли юкланиши лозим.'
    },
    themeLight: 'Ёруғ',
    themeDark: 'Қоронғи',
    langUz: 'O‘zbek',
    langRu: 'Русский',
    langEn: 'English',
    langKrill: 'Ўзбекча',
    copyLink: 'Ҳаволани нусхалаш',
    copied: 'Нусхаланди!',
    showDescription: 'Тавсифни кўрсатиш',
    hideDescription: 'Тавсифни ёпиш',
    bestQuality: 'Энг юқори сифат',
    highQuality: 'Юқори сифат',
    standardQuality: 'Стандарт сифат'
  }
};
