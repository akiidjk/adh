package redis

import (
	"strings"
	"testing"
)

func TestRequestKeysAreUniqueAndNamespaced(t *testing.T) {
	seen := make(map[string]struct{}, 1000)
	for range 1000 {
		key, err := newRequestKey()
		if err != nil {
			t.Fatal(err)
		}
		if !strings.HasPrefix(key, requestPrefix) {
			t.Fatalf("key %q has the wrong prefix", key)
		}
		if _, exists := seen[key]; exists {
			t.Fatalf("duplicate key %q", key)
		}
		seen[key] = struct{}{}
	}
}
