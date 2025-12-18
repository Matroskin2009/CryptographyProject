document.addEventListener('DOMContentLoaded', () => {
  let mode = null
  const info = {
    chacha20: {
      name: 'ChaCha20',
      type: 'Шифр',
      reversible: true,
      needs_key: true,
      year: 2008,
      author: 'Дэниел Бернстайн (Daniel J. Bernstein)',
      description: 'Современный поточный шифр. Не требует специальных инструкций процессора (в отличие от AES), поэтому особенно быстр на мобильных и слабых устройствах. Используется в TLS 1.3, WhatsApp, WireGuard.',
      use_cases: ['защищённая передача данных', 'мобильные приложения', 'IoT'],
      is_broken: false,
      standard: 'RFC 8439'
    },
    aes_gcm: {
      name: 'AES-GCM',
      type: 'Шифр',
      reversible: true,
      needs_key: true,
      year: 2007,
      author: 'NIST',
      description: 'Режим AES с аутентифицированным шифрованием (Galois/Counter Mode). Обеспечивает не только конфиденциальность, но и целостность данных. Используется в TLS 1.3, IPsec, Signal.',
      use_cases: ['защищённая передача', 'VoIP', 'мессенджеры'],
      is_broken: false,
      standard: 'NIST SP 800-38D'
    },
    rot13: {
      name: 'ROT13',
      type: 'Шифр',
      reversible: true,
      needs_key: false,
      year: '1980-е',
      author: 'Сообщество Usenet / игра NetHack',
      description: 'Простейший шифр замены: каждая буква сдвигается на 13 позиций (A↔N, B↔O и т.д.). Не даёт никакой защиты — легко взламывается вручную. Используется для сокрытия спойлеров или шуток.',
      use_cases: ['спойлеры на форумах', 'обучение основам криптографии'],
      is_broken: true,
      standard: 'De facto'
    },
    sha256: {
      name: 'SHA256',
      type: 'Хеш',
      reversible: false,
      needs_key: false,
      year: 2001,
      author: 'Агентство национальной безопасности США (NSA)',
      description: 'Криптографическая хеш-функция из семейства SHA-2. Превращает любой текст в 256-битный «отпечаток» (64 hex-символа). Коллизии не найдены. Используется в Bitcoin, SSL-сертификатах, цифровых подписях.',
      use_cases: ['проверка целостности файлов', 'блокчейн', 'аутентификация'],
      is_broken: false,
      standard: 'FIPS 180-4'
    },
    sha3: {
      name: 'SHA3-256',
      type: 'Хеш',
      reversible: false,
      needs_key: false,
      year: 2015,
      author: 'Гвидо Бертони, Йоан Дамен, Микаэль Пейн, Кристиан Генон (Keccak)',
      description: 'Новый стандарт хеширования от NIST. Не основан на SHA-2, поэтому устойчив даже если SHA-2 будет взломан. Работает медленнее SHA256, но безопаснее в долгосрочной перспективе.',
      use_cases: ['будущие системы', 'высокая безопасность', 'альтернатива SHA-2'],
      is_broken: false,
      standard: 'FIPS 202'
    },
    md5: {
      name: 'MD5',
      type: 'Хеш',
      reversible: false,
      needs_key: false,
      year: 1992,
      author: 'Рональд Ривест (Ronald Rivest)',
      description: 'Устаревшая хеш-функция. Изначально создавалась для контрольных сумм, но часто ошибочно использовалась для паролей. С 2004 года легко создать коллизии (разные файлы → одинаковый хеш). **Нельзя использовать для защиты!**',
      use_cases: ['проверка целостности НЕ критичных данных', 'история криптографии'],
      is_broken: true,
      standard: 'RFC 1321'
    },
    hmac: {
      name: 'HMAC-SHA256',
      type: 'Имитовставка',
      reversible: false,
      needs_key: true,
      year: 1996,
      author: 'М. Беллавин, Р. Канеткар, Х. Корадо',
      description: 'Механизм имитовставки: хеш + секретный ключ. Позволяет не только проверить целостность данных, но и убедиться, что их отправил владелец ключа. Используется в JWT, API-аутентификации, сетевых протоколах.',
      use_cases: ['аутентификация запросов', 'защита от подделки', 'API'],
      is_broken: false,
      standard: 'RFC 2104'
    },
    base64: {
      name: 'Base64',
      type: 'Кодирование',
      reversible: true,
      needs_key: false,
      year: 1995,
      author: 'RFC 2045 (Netscape, MIME)',
      description: 'Преобразует двоичные данные в текст из 64 символов (A–Z, a–z, 0–9, +, /). Используется для передачи бинарных данных по текстовым каналам (email, JSON, HTML). Не шифрование! Не даёт защиты — легко декодируется любым.',
      use_cases: ['вставка изображений в Data URI', 'передача файлов в API', 'кодирование токенов'],
      is_broken: false,
      standard: 'RFC 4648'
    },
    base32: {
      name: 'Base32',
      type: 'Кодирование',
      reversible: true,
      needs_key: false,
      year: 2006,
      author: 'RFC 4648',
      description: 'Преобразует данные в текст из 32 заглавных символов (A–Z, 2–7). Длиннее Base64, но устойчив к потере регистра и опечаткам. Используется там, где важна надёжность: DNS, QR-коды, OTP-приложения (Google Authenticator). Не шифрование!',
      use_cases: ['HOTP/TOTP-токены', 'DNS-записи', 'передача данных в case-insensitive средах'],
      is_broken: false,
      standard: 'RFC 4648'
    }
  };

  // функция, с помощью которой можно переключаться между экранами
  function show_screen(screen_number) {
    document.querySelectorAll('[class^="display-"]').forEach(display_element => {
      display_element.classList.remove('active');
    });
    document.querySelector(`.display-${screen_number}`).classList.add('active');
  }

  // обработчик кнопок выбора режима. Экран 1
  document.querySelectorAll('.choice_mode').forEach(button_element => {
    button_element.addEventListener('click', event => {
      event.preventDefault();
      mode = button_element.getAttribute('data-mode');
      document.querySelectorAll('.item').forEach((item) =>{
        cipher_id = item.getAttribute('data-name-item');
        cipher = info[cipher_id]

        item.style.display = (mode === 'Рассекретить' && !cipher.reversible) ? 'none' : 'block';
      });
      show_screen(2);
    });
  });

  // обработчик элементов сетки. Экран 2
  document.querySelectorAll('.item').forEach(item_element => {
    item_element.addEventListener('click', () => {
      const name_item = item_element.getAttribute('data-name-item');
      const cipher = info[name_item];
      const type_element = document.querySelector('.type-cipher');

      document.querySelector('.name').textContent = cipher.name;
      document.querySelector('.name').dataset.cipher_id = name_item;
      document.querySelector('.description').textContent = cipher.description;
      document.querySelector('.meta-text').textContent = `Автор: ${cipher.author}. Год: ${cipher.year}. Стандарт: ${cipher.standard}. Используется: ${cipher.use_cases.join(', ')}.`;
      document.querySelector('.key-place').textContent = cipher.needs_key ? 'Для использования нужен ключ' : 'Для использования ключ не нужен';
      document.querySelector('.reversible').textContent = cipher.reversible ? "Является обратимым" : 'Является не обратимым';
      document.querySelector('.is-broken').textContent = cipher.is_broken ? 'Взломан (использование является крайне нежелательным)' : 'Не взломан (можно спокойно использовать)';

      type_element.textContent = `Тип элемента: ${cipher.type}`;

      document.getElementById('key-section').style.display = cipher.needs_key && mode === 'Рассекретить' ? 'block' : 'none';

      show_screen(3);
    });
  });

  // обработчик кнопки "обработать" которая запускает всю серверную логику. Экран 3
  document.querySelector('.action-btn').addEventListener('click', async () => {
  const input_text = document.getElementById('input-data').value.trim();
  if (!input_text) {
    alert('Введите текст');
    return;
  }

  const input_key = document.getElementById('input-key').value || null;
  const cipher_id = document.querySelector('.name').dataset.cipher_id;
  const cipher = info[cipher_id];

  if (cipher.needs_key && !input_key && mode === "Рассекретить") {
    alert('Введите ключ для расшифровки');
    return;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cipher_id: cipher_id,
        data: input_text,
        key: input_key,
        mode: mode
      })
    });

    let answer = await response.json();

    if (typeof answer.result === 'object') {
      answer.result_key = answer.result.result_key;
      answer.result = answer.result.result;
    }

    if (response.ok) {
      document.querySelector('.result').textContent = answer.result;

      const get_key_el = document.querySelector('.get-key');
      const cipher = info[cipher_id];

      if (answer.result_key && cipher.reversible && cipher.needs_key && mode === "Засекретить") {
        get_key_el.textContent = `Ключ: ${answer.result_key}`;
        get_key_el.style.display = 'block';
      } else {
        get_key_el.style.display = 'none';
      }

      document.querySelector('.result-container').style.display = 'block';
    } else {
      alert("При обработке произошла ошибка. Пожалуйста, проверьте вводимые данные или попробуйте позже");
    }
  } catch (err) {
    alert(`Не удалось подключиться к серверу: ${err.message}`);
  }
  });

  // обработчик кнопки "вернуться" которая переносит на первый экран. Экран 3
  document.querySelector('.back-btn').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('input-data').value = '';
    document.getElementById('input-key').value = '';
    document.querySelector('.result').textContent = '';
    document.querySelector('.get-key').textContent = ''
    document.querySelector('.result-container').style.display = 'none';
    show_screen(1);
  });

  //обработчик кнопок копирования
  document.addEventListener('click', (event) => {
  if (event.target.classList.contains('copy-button')) {
    const btn_text = event.target.textContent;
    let text_to_copy = '';

    if (btn_text === 'Копировать текст') {
      text_to_copy = document.querySelector('.result').textContent;
    }

    if (text_to_copy) {
      navigator.clipboard.writeText(text_to_copy).then(() => {
        alert('Скопировано!');
      }).catch(() => {
        alert('Не удалось скопировать');
      });
    }
  }
  });

});
