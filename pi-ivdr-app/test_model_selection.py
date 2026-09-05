import unittest
from unittest.mock import Mock, patch

import app as chatbot


class ModelSelectionTests(unittest.TestCase):
    def test_client_cannot_override_server_model(self):
        for supplied in ({}, {"model": "unapproved-large-model"}, {"model": None}):
            with self.subTest(supplied=supplied):
                upstream = Mock()
                upstream.json.return_value = {"response": "Hello"}
                with patch.object(chatbot, "BACKEND", "ollama"), patch.object(
                    chatbot, "OLLAMA_MODEL", "server-selected-model"
                ), patch.object(chatbot.requests, "post", return_value=upstream) as post:
                    response = chatbot.app.test_client().post(
                        "/chat", json={"message": "Hello", **supplied}
                    )
                    self.assertEqual(response.status_code, 200)
                    self.assertEqual(response.json["response"], "Hello")
                    self.assertEqual(response.json["model"], "server-selected-model")
                    self.assertEqual(post.call_count, 1)
                    self.assertEqual(
                        post.call_args.kwargs["json"]["model"], "server-selected-model"
                    )


if __name__ == "__main__":
    unittest.main()
