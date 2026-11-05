# Terminal na halę: czas pracy i raport produkcji (tablet + Google Sheets)

Aplikacja w przeglądarce na tablet przy stanowisku. Pracownik przykłada brelok RFID, a tablet robi jedno z dwóch, zależnie od ustawienia:

- **Czas pracy**: rejestruje *Początek pracy*, *Wyjście prywatne*, *Wyjście służbowe* albo *Koniec pracy*.
- **Raport produkcji**: pracownik wybiera zlecenie i wpisuje ilość dobrych i braków (z przyczyną).

**Domyślnie tablet robi obie rzeczy:** brelok od razu otwiera zlecenia i raport, a początek pracy zapisuje się sam w tle. Wyjście prywatne, wyjście służbowe i koniec pracy blokują stanowisko. Odblokować je może tylko ten sam brelok albo brelok administratora. Wszystko trafia do arkusza Google. Bez sieci wpisy czekają na tablecie i wysyłają się same, gdy sieć wróci.

Działa na Androidzie, Windowsie i Linuksie: wystarczy przeglądarka Chrome lub Edge.

## Zawartość paczki

| Plik | Do czego |
|---|---|
| `Code.gs` | Skrypt do arkusza Google (zapis danych, lista pracowników i zleceń) |
| `index.html` | Cała aplikacja na tablet |
| `sw.js`, `manifest.webmanifest`, `ikona-*.png` | Uruchamianie bez sieci i instalacja jako aplikacja |

Najpierw możesz sprawdzić, jak to działa: otwórz `index.html` w przeglądarce i wybierz **Wypróbuj w trybie demo**. W demo Jan jeszcze nie zaczął pracy, Anna jest w pracy, a Piotr jest na wyjściu prywatnym. „Kierownik Zmiany” to administrator. Przycisk **Admin** jest w rogu każdego ekranu (PIN 1234).

---

## 1. Arkusz Google i skrypt (ok. 10 minut)

1. Utwórz nowy arkusz Google, np. „Raport produkcji”.
2. **Rozszerzenia → Apps Script**. Usuń zawartość pliku `Code.gs` i wklej zawartość `Code.gs` z paczki. Zapisz.
3. Na górze wybierz funkcję **setup** i kliknij **Uruchom**. Za pierwszym razem Google poprosi o uprawnienia: zaakceptuj je (przy ostrzeżeniu „Aplikacja nie została zweryfikowana” wybierz *Zaawansowane → Przejdź do projektu*).
   Powstaną arkusze: Czas pracy, Obecność, Zestawienie czasu, Dziennik admina, Raporty, Podsumowanie, Pracownicy, Zlecenia, Przyczyny braków, Stanowiska, Ustawienia, Nieznane breloki. W **Ustawieniach** znajdziesz wygenerowany **TOKEN**. Skrypt włącza też przeliczanie zestawienia czasu pracy co godzinę.
4. **Wdróż → Nowe wdrożenie** → ikona zębatki → **Aplikacja internetowa**:
   - Wykonaj jako: **Ja**
   - Kto ma dostęp: **Każdy**
5. Skopiuj **adres URL aplikacji internetowej** (kończy się na `/exec`) i wklej go w arkuszu **Ustawienia** w wierszu `ADRES_SKRYPTU`.

Dostęp „Każdy” jest potrzebny, żeby tablet mógł wysyłać dane bez logowania do Google. Zapis przyjmowany jest tylko z poprawnym tokenem.

> **Po każdej zmianie w kodzie skryptu:** Wdróż → Zarządzaj wdrożeniami → ołówek → Wersja: **Nowa wersja** → Wdróż. Adres się nie zmienia. Bez tego tablety dalej korzystają ze starej wersji.

## 2. Umieszczenie aplikacji w internecie

Aplikację trzeba wystawić pod adresem **https** (wtedy otwiera się też bez sieci). Najprościej i za darmo przez GitHub Pages:

1. Załóż konto na github.com i nowe repozytorium, np. `raport-produkcji`.
2. Wgraj pliki `index.html`, `sw.js`, `manifest.webmanifest`, `ikona-192.png` i `ikona-512.png` (*Add file → Upload files*).
3. **Settings → Pages** → Branch: `main`, folder `/ (root)` → Save.
4. Po minucie aplikacja będzie dostępna pod adresem `https://TWOJA-NAZWA.github.io/raport-produkcji/`. Wpisz go w arkuszu **Ustawienia** w wierszu `ADRES_APLIKACJI`.

Strona jest publiczna, ale nie zawiera żadnych danych ani tokenu. Te zostają tylko w pamięci skonfigurowanego tabletu. Może też leżeć na dowolnym własnym serwerze z https.

## 3. Konfiguracja tabletu krok po kroku

### 3.1. Co to jest link konfiguracyjny

Tablet musi wiedzieć trzy rzeczy: **dokąd wysyłać dane** (adres skryptu Google), **hasło** (token) i **przy którym stanowisku stoi**. Wpisywanie tego na tablecie jest niewygodne, więc dokleja się te dane do adresu aplikacji. Taki adres to **link konfiguracyjny**:

```
https://firma.github.io/raport-produkcji/?api=https://script.google.com/macros/s/AKfy…/exec&token=rp3fa5ee9f0b084f69&stanowisko=CNC-01&tryb=oba
```

| Część linku | Skąd ją wziąć |
|---|---|
| adres aplikacji | z punktu 2 (GitHub Pages), np. `https://firma.github.io/raport-produkcji/` |
| `api=` | adres wdrożenia skryptu z punktu 1, kończy się na `/exec` |
| `token=` | arkusz **Ustawienia**, wiersz **TOKEN** |
| `stanowisko=` | nazwa stanowiska, np. `CNC-01` (tak, jak w arkuszu Stanowiska) |
| `tryb=` | `oba` (czas pracy i raport, domyślnie), `rcp` (tylko czas pracy) albo `produkcja` (tylko raport) |

Po pierwszym otwarciu takiego linku aplikacja zapamiętuje ustawienia na tablecie i usuwa je z paska adresu. Każdy tablet ma swój link, bo różnią się tylko stanowiskiem.

### 3.2. Jak zdobyć link

**A) Gotowe linki z arkusza (najprościej):**
1. W arkuszu **Ustawienia** wpisz `ADRES_APLIKACJI` (adres z punktu 2) i `ADRES_SKRYPTU` (adres `/exec` z punktu 1).
2. W arkuszu Google wybierz menu **Raport produkcji → Utwórz linki dla tabletów**.
3. Powstanie arkusz **Linki tabletów** z gotowym linkiem dla każdego stanowiska z arkusza Stanowiska.

Linki zawierają token, więc nie udostępniaj tego arkusza nikomu spoza firmy.

**B) Ręcznie:** skopiuj wzór z punktu 3.1 i podmień części. Niczego nie trzeba dodatkowo kodować.

**C) Bez linku:** otwórz na tablecie sam adres aplikacji. Potem **Admin** → PIN **1234** → **Ustawienia tabletu**, wklej adres skryptu i token, wybierz stanowisko i tryb, naciśnij **Zapisz ustawienia**. Skonfigurowany tablet pokazuje w ustawieniach gotowy link dla kolejnych tabletów.

### 3.3. Jak przenieść link na tablet

- Zaloguj tablet do konta Google, otwórz w Chrome arkusz **Linki tabletów** i dotknij linku swojego stanowiska.
- Albo wyślij link mailem lub komunikatorem na konto, które jest na tablecie, i otwórz go tam.
- Albo przepisz go do paska adresu w Chrome.

### 3.4. Pełny ekran i tryb kiosku

#### Sposób 1: Chrome + przypinanie aplikacji (darmowy, dobry na próbę)

1. **Otwórz link konfiguracyjny w Chrome** (punkt 3.3). Pojawi się ekran „Przyłóż brelok” z nazwą stanowiska.
2. **Zainstaluj aplikację:** menu **⋮** → **Dodaj do ekranu głównego** → **Zainstaluj**. Na ekranie głównym pojawi się ikona „Raport”, która otwiera aplikację na pełnym ekranie, bez paska adresu. Ustawienia z linku zostają, bo zainstalowana aplikacja korzysta z tej samej pamięci co Chrome.
3. **Przypnij aplikację, żeby nie dało się z niej wyjść:**
   - włącz: *Ustawienia → Zabezpieczenia (lub Lokalizacja i blokady) → Zaawansowane → Przypinanie aplikacji*, z wymaganiem PIN-u do odpięcia. Na Samsungu: *Zabezpieczenia i prywatność → Inne ustawienia zabezpieczeń → Przypnij okna*;
   - przypnij: otwórz aplikację, wejdź w ostatnie aplikacje, dotknij ikony nad oknem i wybierz **Przypnij**.
4. **Ekran bez wygaszania:** tablet stale na ładowarce. Najdłuższy czas wygaszania ustawisz w *Ustawienia → Wyświetlacz* (na Samsungu to 10 minut). Opcję „Nigdy” dają opcje programistyczne: 7× dotknij *Numer kompilacji* w *Informacje o tablecie*, potem w *Opcjach programistycznych* włącz **Pozostaw włączony ekran** (podczas ładowania).
5. **Bez usypiania:** na Samsungu w *Ustawienia → Bateria → Limity użycia w tle* upewnij się, że Chrome nie jest na liście „Uśpione” ani „Głęboko uśpione”.

Minusy: po restarcie tabletu przypięcie znika i aplikację trzeba otworzyć ręcznie. Pasek powiadomień też zostaje.

#### Sposób 2: Fully Kiosk Browser (polecany na halę)

Aplikacja z Google Play, zaprojektowana do takich zastosowań. Licencja PLUS kosztuje 8,90 € plus podatek na urządzenie, jednorazowo. Wszystkie funkcje PLUS można wypróbować za darmo, ze znakiem wodnym. Ustaw (nazwy w aplikacji są po angielsku):

- **Start URL:** link konfiguracyjny tego tabletu. Fully ma osobną pamięć, niezależną od Chrome. Przy każdym starcie wczytuje ten link, więc zmiany stanowiska czy trybu rób w Start URL, a nie w ustawieniach aplikacji.
- **Kiosk Mode → Enable Kiosk Mode** i **Kiosk Exit PIN.** To PIN do wyjścia z Fully. Ustaw inny niż PIN przycisku Admin w aplikacji.
- **Launch on Boot:** aplikacja startuje sama po restarcie tabletu.
- **Keep Screen On** i **Fullscreen Mode:** ekran zawsze włączony, bez pasków systemowych.
- Jeśli w Twojej wersji jest opcja przeładowania strony po odzyskaniu sieci, włącz ją.

Czytnik RFID na USB działa w Fully tak samo jak w Chrome. Fully korzysta z „Android System WebView”, więc aktualizuj go w Google Play razem z Chrome.

#### Sposób 3: dużo tabletów

Przy kilkunastu i więcej tabletach lepszy jest tryb urządzenia dedykowanego z centralnym zarządzaniem: Samsung Knox Configure, Microsoft Intune albo Android Enterprise „dedicated device”. Tablety ustawiasz wtedy zdalnie.

#### Windows i Linux

`chrome --kiosk "LINK_KONFIGURACYJNY"`. Dodaj to do autostartu.

### 3.5. Rady na halę

- Tablet stale na ładowarce. Na Samsungu włącz **ochronę baterii** (ładowanie do ok. 85%), żeby bateria nie puchła od ciągłego ładowania.
- Wyłącz automatyczne aktualizacje systemu w godzinach pracy.
- Zapisz w bezpiecznym miejscu **trzy różne PIN-y**: blokady tabletu, wyjścia z kiosku (przypinanie albo Fully) i przycisku Admin w aplikacji (`PIN_ADMINA` w arkuszu Ustawienia).

## 4. Czytnik RFID

Najprostszy i najpewniejszy jest **czytnik USB działający jak klawiatura** (HID, „keyboard emulation”). Po przyłożeniu breloka „wpisuje” jego numer i naciska Enter. Do tabletu podłączasz go przez przejściówkę USB-C OTG.

- **Częstotliwość czytnika musi pasować do breloków.** Popularne tanie breloki to 125 kHz (EM4100, często nazywane „Unique”). Breloki MIFARE działają na 13,56 MHz. Jeśli firma ma już breloki, np. do wejścia albo do rejestracji czasu pracy, kup czytnik na tę samą częstotliwość. Te same breloki posłużą wtedy i tu.
- Czytnik musi kończyć odczyt klawiszem **Enter**. Większość tak robi domyślnie.
- Sprawdzenie: podłącz czytnik, otwórz dowolną aplikację do notatek i przyłóż brelok. Powinien pojawić się numer.
- Wbudowane NFC tabletu czyta tylko 13,56 MHz, a przeglądarka ma do niego ograniczony dostęp. Dlatego aplikacja korzysta z czytnika USB.

**Android i klawiatura ekranowa:** gdy podłączony jest czytnik, Android uznaje go za klawiaturę i może chować klawiaturę ekranową. Operatorom to nie przeszkadza, bo aplikacja ma własną klawiaturę numeryczną. Do wpisywania ustawień włącz w Androidzie *Ustawienia → System (lub Zarządzanie ogólne) → Klawiatura fizyczna → Pokaż klawiaturę ekranową*. Możesz też skonfigurować tablet linkiem z punktu 3.

## 5. Rejestracja czasu pracy

### Jak to działa razem z raportem produkcji (tryb `oba`, domyślny)

1. **Pracownik przykłada brelok, a tablet od razu otwiera zlecenia i raport.** Jeśli pracownik nie był w pracy, w tle zapisuje się *Początek pracy*. Jeśli był na wyjściu, zapisuje się powrót z wyjścia. Zielony pasek „Zapisano: Początek pracy, 6:02” ma przez 10 s przycisk *Cofnij*.
2. Na dole ekranu raportu są przyciski **Wyjście prywatne**, **Wyjście służbowe** i **Koniec pracy**. Jeśli wpisana ilość nie jest zapisana, tablet najpierw o to zapyta.
3. Po każdym z tych trzech zdarzeń **stanowisko się blokuje**. Pełnoekranowy kolorowy ekran pokazuje, kto wyszedł, jakie to wyjście i od kiedy. Przez 10 s jest tam przycisk *Cofnij* na wypadek pomyłki.
4. **Odblokować może tylko:**
   - **ten sam brelok**: po wyjściu zapisuje powrót, po końcu pracy nowy początek pracy, i otwiera raport;
   - **brelok administratora**: odblokowuje stanowisko bez zapisywania zdarzeń za pracownika. Odblokowanie trafia do arkusza Dziennik admina.

   Inny brelok na zablokowanym stanowisku nic nie zapisuje. Tablet pokazuje tylko, kto może odblokować.
5. Blokada zostaje także po restarcie tabletu.

Jeśli blokada po końcu pracy przeszkadza, np. następna zmiana musiałaby co dzień wołać administratora, ustaw `BLOKADA_PO_KONCU` na `NIE`. Analogicznie działa `BLOKADA_PO_WYJSCIU`.

Jeśli tablet miał nieaktualne dane, np. pracownik skończył pracę na innym tablecie, to po odczycie stanu z arkusza sam dopisze nowy początek pracy.

### Administrator

- **Przycisk Admin** jest w rogu każdego ekranu (na ekranie raportu w górnym pasku). Otwiera go PIN albo brelok administratora.
- Administratora oznaczasz w arkuszu **Pracownicy**: kolumna *Administrator* = `TAK`. Jego brelok przyłożony w dowolnym momencie od razu otwiera panel i zdejmuje blokadę stanowiska.
- W panelu administratora są:
  - **Odblokuj stanowisko**
  - **Symuluj brelok**: dowolny pracownik, administrator albo nieznany brelok, czyli testowanie bez czytnika. Zdarzenia z symulacji dostają w arkuszu uwagę „zapis przez administratora (symulacja breloka)” i trafiają do Dziennika admina.
  - **Ostatnio odczytany brelok**: numer ostatniego przyłożonego breloka, przydatny przy dodawaniu nowych osób.
  - Ustawienia tabletu, Ostatnie wpisy i zdarzenia, Wyślij kolejkę teraz, Pobierz dane z arkusza, Uruchom aplikację ponownie.
  - Jeśli administrator wszedł brelokiem, także *Zaloguj jako pracownik*, gdy sam pracuje na stanowisku.

Arkusz **Dziennik admina** zapisuje odblokowania i symulacje breloków: kto, kiedy, na którym stanowisku.

### Tylko czas pracy (tryb `rcp`)

Po przyłożeniu breloka tablet pokazuje imię, aktualny stan pracownika i 4 duże przyciski. Aktywne są tylko te, które mają sens:

| Stan pracownika | Możliwe zdarzenia |
|---|---|
| Poza pracą | Początek pracy (zapisuje się sam po 3 s) |
| W pracy | Koniec pracy, Wyjście prywatne, Wyjście służbowe |
| Na wyjściu prywatnym lub służbowym | Początek pracy (powrót z wyjścia), Koniec pracy |

- Gdy możliwe jest tylko jedno zdarzenie, tablet odlicza 3 sekundy i zapisuje je sam. Przyjście do pracy to więc samo przyłożenie breloka.
- Na ekranie startowym można **najpierw wybrać zdarzenie**, a potem przyłożyć brelok. Tablet zapisze je od razu, o ile jest możliwe.
- **Powrót z wyjścia** jest zapisywany jako *Początek pracy* z uwagą „powrót z wyjścia prywatnego (25 min)”.
- Po zapisie przez kilka sekund widać pełnoekranowe potwierdzenie z przyciskiem **Cofnij**. Ponowny odczyt tego samego breloka w tym czasie jest ignorowany.
- Stan pracownika jest wspólny dla wszystkich tabletów: można zacząć pracę przy bramie, a skończyć przy maszynie. Przy każdym przyłożeniu tablet sprawdza w arkuszu świeży stan.
- Jeśli ktoś zapomni odbić koniec pracy, po 16 godzinach (`MAX_ZMIANA_H`) tablet uzna go za „poza pracą”, pokaże ostrzeżenie i pozwoli zacząć nowy dzień.

Jeśli wolisz, żeby pracownik zawsze sam wybierał spośród wszystkich 4 przycisków, ustaw `RCP_TRYB` na `RECZNY`. Żeby wyłączyć tylko samoczynny zapis, ustaw `RCP_AUTO_S` na `0`.

**Arkusze czasu pracy:**

- **Czas pracy**: dziennik wszystkich zdarzeń (kto, co, kiedy, przy którym stanowisku). Tylko dopisywanie, nie edytuj go ręcznie.
- **Obecność**: aktualny stan każdego pracownika (w pracy / na wyjściu / poza pracą) i od kiedy. To bieżąca lista obecności.
- **Zestawienie czasu**: jeden wiersz na jeden dzień pracy pracownika: początek, koniec, obecność, suma wyjść prywatnych i służbowych, czas pracy oraz uwagi (np. „brak końca pracy”). Przelicza się co godzinę, a od razu po wybraniu *Raport produkcji → Przelicz zestawienie czasu pracy*.

Zasady liczenia: **czas pracy = obecność − wyjścia prywatne**. Wyjście służbowe liczy się jako czas pracy. Nocna zmiana liczy się do dnia, w którym się zaczęła.

## 6. Dodawanie pracowników, zleceń i przyczyn

**Pracownicy.** Kolumny: UID breloka, Imię i nazwisko, Nr pracownika, Aktywny, Administrator. Najłatwiej zarejestrować brelok przez sam tablet:
1. Przyłóż nowy brelok do czytnika. Tablet pokaże „Nieznany brelok” i jego numer.
2. Numer pojawi się w arkuszu **Nieznane breloki**.
3. Skopiuj go do arkusza **Pracownicy** razem z imieniem i nazwiskiem.

Dzięki temu numer ma dokładnie ten format, który podaje Twój czytnik. Zera na początku numeru nie mają znaczenia. Żeby zablokować brelok, wpisz `NIE` w kolumnie *Aktywny*.

**Zlecenia.** Jeden wiersz to jeden detal: Zlecenie, Detal, Nazwa, Stanowiska i Aktywne. W kolumnie *Stanowiska* wpisz, przy których stanowiskach detal ma się pokazywać (np. `CNC-01, CNC-02`). Puste pole oznacza wszystkie stanowiska. Zakończone zlecenia oznacz `NIE` w kolumnie *Aktywne*.

**Przyczyny braków i stanowiska** to proste listy. Zmiany docierają do tabletów w ciągu 5 minut albo od razu po ponownym uruchomieniu aplikacji.

**Ustawienia:**

| Klucz | Znaczenie |
|---|---|
| TOKEN | Hasło API wpisywane na tabletach |
| ADRES_APLIKACJI | Adres aplikacji na tablet (GitHub Pages), do tworzenia linków dla tabletów |
| ADRES_SKRYPTU | Adres wdrożenia skryptu (`/exec`), do tworzenia linków dla tabletów |
| PIN_ADMINA | PIN do ustawień tabletu |
| AUTO_WYLOGOWANIE_S | Po ilu sekundach bez dotyku wylogować pracownika (domyślnie 60) |
| ZMIANY | Godziny rozpoczęcia zmian, np. `6,14,22` albo `6,18` |
| POTWIERDZ_POWYZEJ | Powyżej tej łącznej ilości tablet pyta „czy na pewno” (literówka 1200 zamiast 120) |
| RCP_TRYB | `PODPOWIEDZ`: tylko możliwe zdarzenia, a jedyne możliwe zapisuje się samo. `RECZNY`: zawsze 4 przyciski |
| RCP_AUTO_S | Po ilu sekundach zapisać jedyne możliwe zdarzenie (0 = nigdy samo) |
| MAX_ZMIANA_H | Po ilu godzinach bez końca pracy uznać, że pracownik zapomniał go odbić (domyślnie 16) |
| BLOKADA_PO_WYJSCIU | `TAK`: po wyjściu prywatnym lub służbowym stanowisko odblokuje tylko ten sam brelok albo administrator |
| BLOKADA_PO_KONCU | `TAK`: po końcu pracy stanowisko odblokuje tylko ten sam brelok albo administrator |

## Jak wygląda raport produkcji

1. Przykłada brelok, pojawia się jego imię.
2. Dotyka kafelka z detalem.
3. Wpisuje ilość dobrych. Jeśli są braki, dotyka pola *Braki*, wpisuje ilość i wybiera przyczynę.
4. Naciska **Zapisz**. Zielony ekran potwierdza zapis i przez chwilę daje możliwość cofnięcia.
5. Po minucie bez dotyku tablet sam wylogowuje. Przyłożenie innego breloka przełącza na inną osobę.

W trybie `oba` raport otwiera się sam po przyłożeniu breloka (patrz punkt 5).

Swój wpis pracownik może cofnąć do 15 minut po zapisaniu (*Ostatnie wpisy*). Cofnięty wiersz zostaje w arkuszu ze statusem `ANULOWANY`, więc nic nie ginie bez śladu.

## Dane produkcji w arkuszu

**Raporty** to dziennik: każdy wpis to jeden wiersz, a aplikacja tylko dopisuje. Nie edytuj go ręcznie. Do analiz używaj arkusza **Podsumowanie** (sumy dobrych i braków wg dnia, zmiany, stanowiska i detalu) albo własnych tabel przestawnych na osobnych arkuszach. Licz tylko wiersze ze statusem `ZAPISANY`.

- *Czas zdarzenia* to moment naciśnięcia Zapisz na tablecie, a *Czas zapisu* to moment dotarcia wpisu do arkusza. Różnią się, gdy tablet był offline.
- *Data zmiany*: nocna zmiana po północy liczy się do dnia, w którym się zaczęła.
- Każdy wpis ma unikalne ID nadane na tablecie. Ponowne wysłanie (np. po zerwaniu połączenia) nie tworzy duplikatu.

## Ograniczenia, o których warto wiedzieć

- Google Sheets dobrze się sprawdza przy kilku–kilkunastu tabletach. Cały plik mieści do 10 mln komórek, co daje kilkaset tysięcy wpisów. Starsze dane można co jakiś czas przenosić do archiwum.
- Zapis przez Apps Script trwa zwykle 1–3 s, ale operator nie czeka, bo wysyłka idzie w tle.
- Wpisy oczekujące w kolejce są w pamięci przeglądarki tabletu. Nie czyść danych przeglądarki, dopóki status nie pokazuje „Wszystko wysłane”.
- Token chroni przed przypadkowym zapisem z zewnątrz, ale to nie jest pełne uwierzytelnianie. Przy wrażliwych danych warto przejść na własny serwer.

## Najczęstsze problemy

| Objaw | Co zrobić |
|---|---|
| „Zły token API” | Token na tablecie musi być identyczny z wartością TOKEN w arkuszu Ustawienia. |
| „Nieoczekiwana odpowiedź serwera” | Wdrożenie musi mieć dostęp **Każdy**, a adres kończyć się na `/exec` (nie `/dev`). |
| Zmiany w skrypcie nie działają | Wdróż nową wersję (punkt 1, ramka na końcu). |
| Brelok jest „nieznany”, choć jest w arkuszu | Porównaj numer z arkusza Nieznane breloki. Czytnik może podawać inny format (np. HEX zamiast dziesiętnego). |
| Stanowisko zablokowane, a pracownika nie ma | Brelok administratora albo *Admin → PIN → Odblokuj stanowisko*. |
| Tablet pokazuje zły stan pracownika | Sprawdź arkusz Obecność. Pomyłkę najprościej cofnąć od razu na tablecie. Później: wpisz `ANULOWANY` w kolumnie Status w arkuszu Czas pracy i wybierz menu *Raport produkcji → Przelicz obecność*. |
| Brak zleceń na tablecie | Sprawdź kolumny *Aktywne* i *Stanowiska* w arkuszu Zlecenia oraz nazwę stanowiska w ustawieniach tabletu. |
| Po wgraniu nowej wersji tablet pokazuje starą | Aplikacja pobiera nową wersję przy uruchomieniu z siecią. Odśwież stronę albo zrestartuj Fully Kiosk. Jeśli zmieniasz ikony, podnieś też numer w `sw.js` (`raport-produkcji-v1` na `v2`). |
