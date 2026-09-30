# Shipping: additional items pagination

The shipment reference is a fixed tuple position. Twelve trailing package labels use local pagination: true, overriding the scoped config false and showing five per page. The second shipment inherits false. Remove the config to see pagination enabled by default; replace true with {"pageSize": 10} to customize the size. Add reveals the new package; delete on the last page reconciles the page without changing the fixed reference.
