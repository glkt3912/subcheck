import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { SharingService, type ShareData } from "../SharingService";

// グローバルオブジェクトのモック
const mockWindow = {
  open: vi.fn(),
  location: {
    origin: "https://example.com"
  }
};

const mockNavigator = {
  share: vi.fn(),
  clipboard: {
    writeText: vi.fn()
  }
};

const mockDocument = {
  createElement: vi.fn(),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn()
  },
  execCommand: vi.fn()
};

describe("SharingService", () => {
  let sharingService: SharingService;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // グローバルオブジェクトをモック
    Object.defineProperty(global, "window", {
      value: mockWindow,
      writable: true
    });
    Object.defineProperty(global, "navigator", {
      value: mockNavigator,
      writable: true
    });
    Object.defineProperty(global, "document", {
      value: mockDocument,
      writable: true
    });

    sharingService = new SharingService();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("constructor", () => {
    it("デフォルトのbaseUrlを設定する", () => {
      expect(sharingService).toBeInstanceOf(SharingService);
    });

    it("カスタムbaseUrlを受け入れる", () => {
      const customService = new SharingService("https://custom.com");
      expect(customService).toBeInstanceOf(SharingService);
    });
  });

  describe("generateTwitterShareUrl", () => {
    it("基本的なTwitter共有URLを生成する", () => {
      const shareData: ShareData = {
        title: "テストタイトル",
        text: "テストテキスト"
      };

      const url = sharingService.generateTwitterShareUrl(shareData);

      expect(url).toContain("https://twitter.com/intent/tweet");
      expect(url).toContain(encodeURIComponent("テストタイトル"));
      expect(url).toContain(encodeURIComponent("テストテキスト"));
    });

    it("URL付きのTwitter共有URLを生成する", () => {
      const shareData: ShareData = {
        title: "タイトル",
        text: "テキスト",
        url: "https://example.com"
      };

      const url = sharingService.generateTwitterShareUrl(shareData);

      expect(url).toContain("url=https%3A%2F%2Fexample.com");
    });

    it("ハッシュタグ付きのTwitter共有URLを生成する", () => {
      const shareData: ShareData = {
        title: "タイトル",
        text: "テキスト",
        hashtags: ["SubCheck", "節約"]
      };

      const url = sharingService.generateTwitterShareUrl(shareData);

      expect(url).toContain("hashtags=SubCheck%2C%E7%AF%80%E7%B4%84");
    });

    it("タイトルなしでも正常に動作する", () => {
      const shareData: ShareData = {
        text: "テストテキストのみ"
      };

      const url = sharingService.generateTwitterShareUrl(shareData);

      expect(url).toContain(encodeURIComponent("テストテキストのみ"));
      expect(url).not.toContain("undefined");
    });
  });

  describe("generateLineShareUrl", () => {
    it("基本的なLINE共有URLを生成する", () => {
      const shareData: ShareData = {
        title: "LINEタイトル",
        text: "LINEテキスト"
      };

      const url = sharingService.generateLineShareUrl(shareData);

      expect(url).toContain("https://social-plugins.line.me/lineit/share");
      expect(url).toContain(encodeURIComponent("LINEタイトル"));
      expect(url).toContain(encodeURIComponent("LINEテキスト"));
    });

    it("URL付きのLINE共有URLを生成する", () => {
      const shareData: ShareData = {
        title: "タイトル",
        text: "テキスト",
        url: "https://line-example.com"
      };

      const url = sharingService.generateLineShareUrl(shareData);

      expect(url).toContain(encodeURIComponent("https://line-example.com"));
    });
  });

  describe("shareToTwitter", () => {
    it("Twitter共有が成功する", async () => {
      const shareData: ShareData = {
        title: "成功テスト",
        text: "Twitter共有テスト"
      };

      const result = await sharingService.shareToTwitter(shareData);

      expect(result.success).toBe(true);
      expect(result.platform).toBe("twitter");
      expect(mockWindow.open).toHaveBeenCalledWith(
        expect.stringContaining("https://twitter.com/intent/tweet"),
        "_blank",
        "width=550,height=420,scrollbars=yes,resizable=yes"
      );
    });

    it("Twitter共有でエラーが発生した場合の処理", async () => {
      // window.openでエラーを発生させる
      mockWindow.open.mockImplementation(() => {
        throw new Error("ポップアップがブロックされました");
      });

      const shareData: ShareData = {
        title: "エラーテスト",
        text: "エラーテスト"
      };

      const result = await sharingService.shareToTwitter(shareData);

      expect(result.success).toBe(false);
      expect(result.platform).toBe("twitter");
      expect(result.error).toBe("ポップアップがブロックされました");
    });
  });

  describe("shareToLine", () => {
    it("LINE共有が成功する", async () => {
      const shareData: ShareData = {
        title: "LINE成功テスト",
        text: "LINE共有テスト"
      };

      const result = await sharingService.shareToLine(shareData);

      expect(result.success).toBe(true);
      expect(result.platform).toBe("line");
      expect(mockWindow.open).toHaveBeenCalledWith(
        expect.stringContaining("https://social-plugins.line.me/lineit/share"),
        "_blank",
        "width=550,height=420,scrollbars=yes,resizable=yes"
      );
    });
  });

  describe("shareNative", () => {
    it("ネイティブ共有が成功する", async () => {
      mockNavigator.share.mockResolvedValue(undefined);

      const shareData: ShareData = {
        title: "ネイティブテスト",
        text: "ネイティブ共有テスト",
        url: "https://native-test.com"
      };

      const result = await sharingService.shareNative(shareData);

      expect(result.success).toBe(true);
      expect(result.platform).toBe("native");
      expect(mockNavigator.share).toHaveBeenCalledWith({
        title: "ネイティブテスト",
        text: "ネイティブ共有テスト",
        url: "https://native-test.com"
      });
    });

    it("ネイティブ共有がサポートされていない場合", async () => {
      // navigatorを無効化
      Object.defineProperty(global, "navigator", {
        value: {},
        writable: true
      });

      const shareData: ShareData = {
        title: "サポートなしテスト",
        text: "テスト"
      };

      const result = await sharingService.shareNative(shareData);

      expect(result.success).toBe(false);
      expect(result.platform).toBe("native");
      expect(result.error).toBe("Native sharing not supported");
    });

    it("ネイティブ共有でユーザーがキャンセルした場合", async () => {
      mockNavigator.share.mockRejectedValue(new Error("User cancelled"));

      const shareData: ShareData = {
        title: "キャンセルテスト",
        text: "テスト"
      };

      const result = await sharingService.shareNative(shareData);

      expect(result.success).toBe(false);
      expect(result.platform).toBe("native");
      expect(result.error).toBe("User cancelled");
    });
  });

  describe("isNativeSharingAvailable", () => {
    it("ネイティブ共有が利用可能な場合", () => {
      expect(sharingService.isNativeSharingAvailable()).toBe(true);
    });

    it("ネイティブ共有が利用不可能な場合", () => {
      Object.defineProperty(global, "navigator", {
        value: { share: undefined },
        writable: true
      });

      expect(sharingService.isNativeSharingAvailable()).toBe(false);
    });

    it("navigatorが存在しない場合", () => {
      Object.defineProperty(global, "navigator", {
        value: undefined,
        writable: true
      });

      expect(sharingService.isNativeSharingAvailable()).toBe(false);
    });
  });

  describe("share (オート選択)", () => {
    it("指定されたプラットフォームで共有する", async () => {
      const shareData: ShareData = {
        title: "プラットフォーム指定",
        text: "テスト"
      };

      const twitterResult = await sharingService.share(shareData, "twitter");
      expect(twitterResult.platform).toBe("twitter");

      const lineResult = await sharingService.share(shareData, "line");
      expect(lineResult.platform).toBe("line");

      mockNavigator.share.mockResolvedValue(undefined);
      const nativeResult = await sharingService.share(shareData, "native");
      expect(nativeResult.platform).toBe("native");
    });

    it("ネイティブ共有が利用可能な場合は自動選択する", async () => {
      mockNavigator.share.mockResolvedValue(undefined);

      const shareData: ShareData = {
        title: "オート選択",
        text: "テスト"
      };

      const result = await sharingService.share(shareData);

      expect(result.platform).toBe("native");
    });

    it("ネイティブ共有が利用不可能な場合はTwitterにフォールバック", async () => {
      Object.defineProperty(global, "navigator", {
        value: {},
        writable: true
      });

      const shareData: ShareData = {
        title: "フォールバック",
        text: "テスト"
      };

      const result = await sharingService.share(shareData);

      expect(result.platform).toBe("twitter");
    });
  });

  describe("copyToClipboard", () => {
    it("Clipboard APIでコピーが成功する", async () => {
      mockNavigator.clipboard.writeText.mockResolvedValue(undefined);

      const result = await sharingService.copyToClipboard("コピーテスト");

      expect(result).toBe(true);
      expect(mockNavigator.clipboard.writeText).toHaveBeenCalledWith("コピーテスト");
    });

    it("Clipboard APIでエラーが発生した場合のフォールバック", async () => {
      // Clipboard APIを無効化
      Object.defineProperty(global, "navigator", {
        value: { clipboard: undefined },
        writable: true
      });

      // フォールバックメソッドの設定
      const mockTextArea = {
        value: "",
        style: {},
        focus: vi.fn(),
        select: vi.fn()
      };
      mockDocument.createElement.mockReturnValue(mockTextArea);
      mockDocument.execCommand.mockReturnValue(true);

      const result = await sharingService.copyToClipboard("フォールバックテスト");

      expect(result).toBe(true);
      expect(mockDocument.createElement).toHaveBeenCalledWith("textarea");
      expect(mockTextArea.value).toBe("フォールバックテスト");
      expect(mockDocument.execCommand).toHaveBeenCalledWith("copy");
    });

    it("すべての方法でコピーが失敗した場合", async () => {
      // すべてのAPIを無効化
      Object.defineProperty(global, "navigator", {
        value: {},
        writable: true
      });
      Object.defineProperty(global, "document", {
        value: undefined,
        writable: true
      });

      const result = await sharingService.copyToClipboard("失敗テスト");

      expect(result).toBe(false);
    });

    it("例外が発生した場合の処理", async () => {
      mockNavigator.clipboard.writeText.mockRejectedValue(new Error("Permission denied"));

      // console.errorをモック
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await sharingService.copyToClipboard("例外テスト");

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith("Failed to copy to clipboard:", expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe("エッジケース", () => {
    it("空の文字列でも正常に処理する", () => {
      const shareData: ShareData = {
        title: "",
        text: ""
      };

      const twitterUrl = sharingService.generateTwitterShareUrl(shareData);
      expect(twitterUrl).toContain("https://twitter.com/intent/tweet");
      
      const lineUrl = sharingService.generateLineShareUrl(shareData);
      expect(lineUrl).toContain("https://social-plugins.line.me/lineit/share");
    });

    it("特殊文字が含まれる場合の処理", () => {
      const shareData: ShareData = {
        title: "特殊文字テスト !@#$%^&*()",
        text: "絵文字テスト 🎉🎊✨"
      };

      const twitterUrl = sharingService.generateTwitterShareUrl(shareData);
      expect(twitterUrl).toContain(encodeURIComponent("特殊文字テスト"));
      expect(twitterUrl).toContain(encodeURIComponent("🎉🎊✨"));
    });

    it("非常に長いテキストの処理", () => {
      const longText = "あ".repeat(1000);
      const shareData: ShareData = {
        title: "長文テスト",
        text: longText
      };

      const twitterUrl = sharingService.generateTwitterShareUrl(shareData);
      expect(twitterUrl).toContain(encodeURIComponent(longText));
    });
  });

  describe("window未定義環境での動作", () => {
    beforeEach(() => {
      Object.defineProperty(global, "window", {
        value: undefined,
        writable: true
      });
    });

    it("window未定義でもSharingServiceのインスタンス作成が可能", () => {
      const service = new SharingService();
      expect(service).toBeInstanceOf(SharingService);
    });

    it("window未定義でもURL生成は正常に動作する", () => {
      const service = new SharingService();
      const shareData: ShareData = {
        title: "SSRテスト",
        text: "サーバーサイドレンダリング"
      };

      const url = service.generateTwitterShareUrl(shareData);
      expect(url).toContain("https://twitter.com/intent/tweet");
    });
  });
});